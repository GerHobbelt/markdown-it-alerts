// Process block-level custom containers


var markdownItContainer = function container_plugin(md, name, options) {

  function validateDefault(params) {
    return params.trim().split(' ', 2)[0] === name;
  }

  function renderDefault(tokens, idx, _options, env, _self) {

    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      tokens[idx].attrPush([ 'class', name ]);
    }

    return _self.renderToken(tokens, idx, _options, env, _self);
  }

  options = options || {};

  var min_markers = 3,
      marker_str  = options.marker || ':',
      marker_char = marker_str.charCodeAt(0),
      marker_len  = marker_str.length,
      validate    = options.validate || validateDefault,
      render      = options.render || renderDefault;

  function container(state, startLine, endLine, silent) {
    var pos, nextLine, marker_count, markup, params, token,
        old_parent, old_line_max,
        auto_closed = false,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (marker_char !== state.src.charCodeAt(start)) { return false; }

    // Check out the rest of the marker string
    //
    for (pos = start + 1; pos <= max; pos++) {
      if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
        break;
      }
    }

    marker_count = Math.floor((pos - start) / marker_len);
    if (marker_count < min_markers) { return false; }
    pos -= (pos - start) % marker_len;

    markup = state.src.slice(start, pos);
    params = state.src.slice(pos, max);
    if (!validate(params)) { return false; }

    // Since start is found, we can report success here in validation mode
    //
    if (silent) { return true; }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (marker_char !== state.src.charCodeAt(start)) { continue; }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      for (pos = start + 1; pos <= max; pos++) {
        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
          break;
        }
      }

      // closing code fence must be at least as long as the opening one
      if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

      // make sure tail has spaces only
      pos -= (pos - start) % marker_len;
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      // found!
      auto_closed = true;
      break;
    }

    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = 'container';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token        = state.push('container_' + name + '_open', 'div', 1);
    token.markup = markup;
    token.block  = true;
    token.info   = params;
    token.map    = [ startLine, nextLine ];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token        = state.push('container_' + name + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block  = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'container_' + name, container, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules['container_' + name + '_open'] = render;
  md.renderer.rules['container_' + name + '_close'] = render;
};

/**
 * Created by vikram on 9/11/2015.
 */

let Sanscript = function () {};

Sanscript.defaults = {
  skip_sgml: false,
  syncope: false,
  enableTamilPronounciation: true,
  enableTamilCharPositionFixes: true,
  enableSanskritVedicAccents : true
};

    /* Schemes
     * =======
     * Schemes are of two kinds: "Brahmic" and "roman." "Brahmic" schemes
     * describe abugida scripts found in India. "Roman" schemes describe
     * manufactured alphabets that are meant to describe or encode Brahmi
     * scripts. Abugidas and alphabets are processed by separate algorithms
     * because of the unique difficulties involved with each.
     *
     * Brahmic consonants are stated without a virama. Roman consonants are
     * stated without the vowel 'a'.
     *
     * (Since "abugida" is not a well-known term, Sanscript uses "Brahmic"
     * and "roman" for clarity.)
     */
let schemes = Sanscript.schemes = {

            /* Bengali
             * -------
             * 'va' and 'ba' are both rendered as ব.
             */
      bengali: {
        vowels: 'অ আ ই ঈ উ ঊ ঋ ৠ ঌ ৡ  এ ঐ  ও ঔ'.split(' '),
        vowel_marks: 'া ি ী ু ূ ৃ ৄ ৢ ৣ  ে ৈ  ো ৌ'.split(' '),
        other_marks: 'ং ঃ ঁ'.split(' '),
        virama: [ '্' ],
        consonants: 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল ব শ ষ স হ ळ ক্ষ জ্ঞ'.split(' '),
        symbols: '০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯ ॐ ঽ । ॥'.split(' '),
        other: '    ড ঢ  য '.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Devanagari
             * ----------
             * The most comprehensive and unambiguous Brahmic script listed.
             */
      devanagari: {
                // "Independent" forms of the vowels. These are used whenever the
                // vowel does not immediately follow a consonant.
        vowels: 'अ आ इ ई उ ऊ ऋ ॠ ऌ ॡ ऎ ए ऐ ऒ ओ औ'.split(' '),

                // "Dependent" forms of the vowels. These are used whenever the
                // vowel immediately follows a consonant. If a letter is not
                // listed in `vowels`, it should not be listed here.
        vowel_marks: 'ा ि ी ु ू ृ ॄ ॢ ॣ ॆ े ै ॊ ो ौ'.split(' '),

                // Miscellaneous marks, all of which are used in Sanskrit.
        other_marks: 'ं ः ँ'.split(' '),

                // In syllabic scripts like Devanagari, consonants have an inherent
                // vowel that must be suppressed explicitly. We do so by putting a
                // virama after the consonant.
        virama: [ '्' ],

                // Various Sanskrit consonants and consonant clusters. Every token
                // here has an explicit vowel. Thus "क" is "ka" instead of "k".
        consonants: 'क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह ळ क्ष ज्ञ'.split(' '),

                // Numbers and punctuation
        symbols: '० १ २ ३ ४ ५ ६ ७ ८ ९ ॐ ऽ । ॥'.split(' '),

                // Zero-width joiner. This is used to separate a consonant cluster
                // and avoid a complex ligature.
        zwj: [ '\u200D' ],

                // Dummy consonant. This is used in ITRANS to prevert certain types
                // of parser ambiguity. Thus "barau" -> बरौ but "bara_u" -> बरउ.
        skip: [ '' ],

                // Vedic accent. Udatta and anudatta.
        accent: [ '\u0951', '\u0952' ],

                // Accent combined with anusvara and and visarga. For compatibility
                // with ITRANS, which allows the reverse of these four.
        combo_accent: 'ः॑ ः॒ ं॑ ं॒'.split(' '),

        candra: [ 'ॅ' ],

                // Non-Sanskrit consonants
        other: 'क़ ख़ ग़ ज़ ड़ ढ़ फ़ य़ ऱ'.split(' ')
      },

            /* Gujarati
             * --------
             * Sanskrit-complete.
             */
      gujarati: {
        vowels: 'અ આ ઇ ઈ ઉ ઊ ઋ ૠ ઌ ૡ  એ ઐ  ઓ ઔ'.split(' '),
        vowel_marks: 'ા િ ી ુ ૂ ૃ ૄ ૢ ૣ  ે ૈ  ો ૌ'.split(' '),
        other_marks: 'ં ઃ ઁ'.split(' '),
        virama: [ '્' ],
        consonants: 'ક ખ ગ ઘ ઙ ચ છ જ ઝ ઞ ટ ઠ ડ ઢ ણ ત થ દ ધ ન પ ફ બ ભ મ ય ર લ વ શ ષ સ હ ળ ક્ષ જ્ઞ'.split(' '),
        symbols: '૦ ૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯ ૐ ઽ . ..'.split(' '),
        candra: [ 'ૅ' ],
        skip: [ '' ],
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ],
        other: 'ક ખ ગ જ ડ ઢ ફ ય ર'.split(' ')
      },

            /* Gurmukhi
             * --------
             * Missing R/RR/lR/lRR
             */
      gurmukhi: {
        vowels: 'ਅ ਆ ਇ ਈ ਉ ਊ      ਏ ਐ  ਓ ਔ'.split(' '),
        vowel_marks: 'ਾ ਿ ੀ ੁ ੂ      ੇ ੈ  ੋ ੌ'.split(' '),
        other_marks: 'ਂ ਃ ਁ'.split(' '),
        virama: [ '੍' ],
        consonants: 'ਕ ਖ ਗ ਘ ਙ ਚ ਛ ਜ ਝ ਞ ਟ ਠ ਡ ਢ ਣ ਤ ਥ ਦ ਧ ਨ ਪ ਫ ਬ ਭ ਮ ਯ ਰ ਲ ਵ ਸ਼ ਸ਼ ਸ ਹ ਲ਼ ਕ੍ਸ਼ ਜ੍ਞ'.split(' '),
        symbols: '੦ ੧ ੨ ੩ ੪ ੫ ੬ ੭ ੮ ੯ ॐ ऽ । ॥'.split(' '),
        other: ' ਖ ਗ ਜ ਡ  ਫ  '.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Kannada
             * -------
             * Sanskrit-complete.
             */
      kannada: {
        vowels: 'ಅ ಆ ಇ ಈ ಉ ಊ ಋ ೠ ಌ ೡ ಎ ಏ ಐ ಒ ಓ ಔ'.split(' '),
        vowel_marks: 'ಾ ಿ ೀ ು ೂ ೃ ೄ ೢ ೣ ೆ ೇ ೈ ೊ ೋ ೌ'.split(' '),
        other_marks: 'ಂ ಃ ँ'.split(' '),
        virama: [ '್' ],
        consonants: 'ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ ಟ ಠ ಡ ಢ ಣ ತ ಥ ದ ಧ ನ ಪ ಫ ಬ ಭ ಮ ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ ಳ ಕ್ಷ ಜ್ಞ'.split(' '),
        symbols: '೦ ೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯ ಓಂ ಽ । ॥'.split(' '),
        other: '      ಫ  ಱ'.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Malayalam
             * ---------
             * Sanskrit-complete.
             */
      malayalam: {
        vowels: 'അ ആ ഇ ഈ ഉ ഊ ഋ ൠ ഌ ൡ എ ഏ ഐ ഒ ഓ ഔ'.split(' '),
        vowel_marks: 'ാ ി ീ ു ൂ ൃ ൄ ൢ ൣ െ േ ൈ ൊ ോ ൌ'.split(' '),
        other_marks: 'ം ഃ ँ'.split(' '),
        virama: [ '്' ],
        consonants: 'ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ഞ ട ഠ ഡ ഢ ണ ത ഥ ദ ധ ന പ ഫ ബ ഭ മ യ ര ല വ ശ ഷ സ ഹ ള ക്ഷ ജ്ഞ'.split(' '),
        symbols: '൦ ൧ ൨ ൩ ൪ ൫ ൬ ൭ ൮ ൯ ഓം ഽ । ॥'.split(' '),
        other: '        റ'.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Oriya
             * -----
             * Sanskrit-complete.
             */
      oriya: {
        vowels: 'ଅ ଆ ଇ ଈ ଉ ଊ ଋ ୠ ଌ ୡ  ଏ ଐ  ଓ ଔ'.split(' '),
        vowel_marks: 'ା ି ୀ ୁ ୂ ୃ ୄ ୢ ୣ  େ ୈ  ୋ ୌ'.split(' '),
        other_marks: 'ଂ ଃ ଁ'.split(' '),
        virama: [ '୍' ],
        consonants: 'କ ଖ ଗ ଘ ଙ ଚ ଛ ଜ ଝ ଞ ଟ ଠ ଡ ଢ ଣ ତ ଥ ଦ ଧ ନ ପ ଫ ବ ଭ ମ ଯ ର ଲ ଵ ଶ ଷ ସ ହ ଳ କ୍ଷ ଜ୍ଞ'.split(' '),
        symbols: '୦ ୧ ୨ ୩ ୪ ୫ ୬ ୭ ୮ ୯ ଓଂ ଽ । ॥'.split(' '),
        other: '    ଡ ଢ  ଯ '.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Tamil
             * -----
             * Missing R/RR/lR/lRR vowel marks and voice/aspiration distinctions.
             * The most incomplete of the Sanskrit schemes here.
             */
      tamil: {
        vowels: 'அ ஆ இ ஈ உ ஊ ருʼ ரூʼ லுʼ லூʼ எ ஏ ஐ ஒ ஓ ஔ'.split(' '),
        vowel_marks: 'ா ி ீ ு ூ ருʼ ரூʼ லுʼ லூʼ ெ ே ை ொ ோ ௌ'.split(' '),
        other_marks: 'ம்’ : '.split(' '),
        virama: [ '்' ],
        consonants: 'க க² க³ க⁴ ங ச ச² ஜ ச ஞ ட ட² ட³ ட⁴ ண த த² த³ த⁴ ந ப ப² ப³ ப⁴ ம ய ர ல வ ஶ ஷ ஸ ஹ ள க்ஷ ஜ்ஞ'.split(' '),
        symbols: '0 1 2 3 4 5 6 7 8 9 ௐ ऽ । ॥'.split(' '),
        other: '        ற'.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* Telugu
             * ------
             * Sanskrit-complete.
             */
      telugu: {
        vowels: 'అ ఆ ఇ ఈ ఉ ఊ ఋ ౠ ఌ ౡ ఎ ఏ ఐ ఒ ఓ ఔ'.split(' '),
        vowel_marks: 'ా ి ీ ు ూ ృ ౄ ౢ ౣ ె ే ై ొ ో ౌ'.split(' '),
        other_marks: 'ం ః ఁ'.split(' '),
        virama: [ '్' ],
        consonants: 'క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ ళ క్ష జ్ఞ'.split(' '),
        symbols: '౦ ౧ ౨ ౩ ౪ ౫ ౬ ౭ ౮ ౯ ఓం ఽ । ॥'.split(' '),
        other: '        ఱ'.split(' '),
        accent: [ '', '' ],
        combo_accent: [ '', '', '', '' ]
      },

            /* International Alphabet of Sanskrit Transliteration
             * --------------------------------------------------
             * The most "professional" Sanskrit romanization scheme.
             */
      iast: {
        vowels: 'a ā i ī u ū ṛ ṝ ḷ ḹ  e ai  o au'.split(' '),
        other_marks: [ 'ṃ', 'ḥ', '~' ],
        virama: [ '' ],
        consonants: 'k kh g gh ṅ c ch j jh ñ ṭ ṭh ḍ ḍh ṇ t th d dh n p ph b bh m y r l v ś ṣ s h ḻ kṣ jñ'.split(' '),
        symbols: "0 1 2 3 4 5 6 7 8 9 oṃ ' । ॥".split(' ')
      },

            /* ITRANS
             * ------
             * One of the first romanization schemes -- and one of the most
             * complicated. For alternate forms, see the "allAlternates" variable
             * below.
             *
             * '_' is a "null" letter, which allows adjacent vowels.
             */
      itrans: {
        vowels: 'a A i I u U RRi RRI LLi LLI  e ai  o au'.split(' '),
        other_marks: [ 'M', 'H', '.N' ],
        virama: [ '' ],
        consonants: 'k kh g gh ~N ch Ch j jh ~n T Th D Dh N t th d dh n p ph b bh m y r l v sh Sh s h L kSh j~n'.split(' '),
        symbols: '0 1 2 3 4 5 6 7 8 9 OM .a | ||'.split(' '),
        candra: [ '.c' ],
        zwj: [ '{}' ],
        skip: '_',
        accent: [ "\\'", '\\_' ],
        combo_accent: "\\'H \\_H \\'M \\_M".split(' '),
        other: 'q K G z .D .Dh f Y R'.split(' ')
      },

            /* Harvard-Kyoto
             * -------------
             * A simple 1:1 mapping.
             */
      hk: {
        vowels: 'a A i I u U R RR lR lRR  e ai  o au'.split(' '),
        other_marks: 'M H ~'.split(' '),
        virama: [ '' ],
        consonants: 'k kh g gh G c ch j jh J T Th D Dh N t th d dh n p ph b bh m y r l v z S s h L kS jJ'.split(' '),
        symbols: "0 1 2 3 4 5 6 7 8 9 OM ' | ||".split(' ')
      },

            /* National Library at Kolkata
             * ---------------------------
             * Apart from using "ē" and "ō" instead of "e" and "o", this scheme is
             * identical to IAST. ṝ, ḷ, and ḹ are not part of the scheme proper.
             *
             * This is defined further below.
             */

            /* Sanskrit Library Phonetic Basic
             * -------------------------------
             * With one ASCII letter per phoneme, this is the tersest transliteration
             * scheme in use today and is especially suited to computer processing.
             */
      slp1: {
        vowels: 'a A i I u U f F x X  e E  o O'.split(' '),
        other_marks: 'M H ~'.split(' '),
        virama: [ '' ],
        consonants: 'k K g G N c C j J Y w W q Q R t T d D n p P b B m y r l v S z s h L kz jY'.split(' '),
        symbols: "0 1 2 3 4 5 6 7 8 9 oM ' . ..".split(' ')
      },

            /* Velthuis
             * --------
             * A case-insensitive Sanskrit encoding.
             */
      velthuis: {
        vowels: 'a aa i ii u uu .r .rr .li .ll  e ai  o au'.split(' '),
        other_marks: '.m .h '.split(' '),
        virama: [ '' ],
        consonants: 'k kh g gh "n c ch j jh ~n .t .th .d .d .n t th d dh n p ph b bh m y r l v ~s .s s h L k.s j~n'.split(' '),
        symbols: "0 1 2 3 4 5 6 7 8 9 o.m ' | ||".split(' ')
      },

            /* WX
             * --
             * As terse as SLP1.
             */
      wx: {
        vowels: 'a A i I u U q Q L   e E  o O'.split(' '),
        other_marks: 'M H z'.split(' '),
        virama: [ '' ],
        consonants: 'k K g G f c C j J F t T d D N w W x X n p P b B m y r l v S R s h  kR jF'.split(' '),
        symbols: "0 1 2 3 4 5 6 7 8 9 oM ' | ||".split(' ')
      }
    },

    // Set of names of schemes
    romanSchemes = {},

    // Map of alternate encodings.
    allAlternates = {
      itrans: {
        A: [ 'aa' ],
        I: [ 'ii', 'ee' ],
        U: [ 'uu', 'oo' ],
        RRi: [ 'R^i' ],
        RRI: [ 'R^I' ],
        LLi: [ 'L^i' ],
        LLI: [ 'L^I' ],
        M: [ '.m', '.n' ],
        '~N': [ 'N^' ],
        ch: [ 'c' ],
        Ch: [ 'C', 'chh' ],
        '~n': [ 'JN' ],
        v: [ 'w' ],
        Sh: [ 'S', 'shh' ],
        kSh: [ 'kS', 'x' ],
        'j~n': [ 'GY', 'dny' ],
        OM: [ 'AUM' ],
        '\\_': [ '\\`' ],
        '\\_H': [ '\\`H' ],
        "\\'M": [ "\\'.m", "\\'.n" ],
        '\\_M': '\\_.m \\_.n \\`M \\`.m \\`.n'.split(' '),
        '.a': [ '~' ],
        '|': [ '.' ],
        '||': [ '..' ],
        z: [ 'J' ]
      }
    },

    // object cache
    cache = {};

    /**
     * Check whether the given scheme encodes romanized Sanskrit.
     *
     * @param name  the scheme name
     * @return      boolean
     */
Sanscript.isRomanScheme = function (name) {
  return romanSchemes.hasOwnProperty(name);
};

    /**
     * Add a Brahmic scheme to Sanscript.
     *
     * Schemes are of two types: "Brahmic" and "roman". Brahmic consonants
     * have an inherent vowel sound, but roman consonants do not. This is the
     * main difference between these two types of scheme.
     *
     * A scheme definition is an object ("{}") that maps a group name to a
     * list of characters. For illustration, see the "devanagari" scheme at
     * the top of this file.
     *
     * You can use whatever group names you like, but for the best results,
     * you should use the same group names that Sanscript does.
     *
     * @param name    the scheme name
     * @param scheme  the scheme data itself. This should be constructed as
     *                described above.
     */
Sanscript.addBrahmicScheme = function (name, scheme) {
  Sanscript.schemes[name] = scheme;
};

    /**
     * Add a roman scheme to Sanscript.
     *
     * See the comments on Sanscript.addBrahmicScheme. The "vowel_marks" field
     * can be omitted.
     *
     * @param name    the scheme name
     * @param scheme  the scheme data itself
     */
Sanscript.addRomanScheme = function (name, scheme) {
  if (!('vowel_marks' in scheme)) {
    scheme.vowel_marks = scheme.vowels.slice(1);
  }
  Sanscript.schemes[name] = scheme;
  romanSchemes[name] = true;
};

    /**
     * Create a deep copy of an object, for certain kinds of objects.
     *
     * @param scheme  the scheme to copy
     * @return        the copy
     */
let cheapCopy = function (scheme) {
  let copy = {};
  for (let key in scheme) {
    if (!scheme.hasOwnProperty(key)) {
      continue;
    }
    copy[key] = scheme[key].slice(0);
  }
  return copy;
};

    // Set up various schemes
(function () {
        // Set up roman schemes
  let kolkata = schemes.kolkata = cheapCopy(schemes.iast),
      schemeNames = 'iast itrans hk kolkata slp1 velthuis wx'.split(' ');
  kolkata.vowels = 'a ā i ī u ū ṛ ṝ ḷ ḹ e ē ai o ō au'.split(' ');

        // These schemes already belong to Sanscript.schemes. But by adding
        // them again with `addRomanScheme`, we automatically build up
        // `romanSchemes` and define a `vowel_marks` field for each one.
  for (var i = 0, name; (name = schemeNames[i]); i++) {
    Sanscript.addRomanScheme(name, schemes[name]);
  }

        // ITRANS variant, which supports Dravidian short 'e' and 'o'.
  let itrans_dravidian = cheapCopy(schemes.itrans);
  itrans_dravidian.vowels = 'a A i I u U Ri RRI LLi LLi e E ai o O au'.split(' ');
  itrans_dravidian.vowel_marks = itrans_dravidian.vowels.slice(1);
  allAlternates.itrans_dravidian = allAlternates.itrans;
  Sanscript.addRomanScheme('itrans_dravidian', itrans_dravidian);
}());

    /**
     * Create a map from every character in `from` to its partner in `to`.
     * Also, store any "marks" that `from` might have.
     *
     * @param from     input scheme
     * @param to       output scheme
     * @param options  scheme options
     */
let makeMap = function (from, to, options) {
  let alternates = allAlternates[from] || {},
      consonants = {},
      fromScheme = Sanscript.schemes[from],
      letters = {},
      tokenLengths = [],
      marks = {},
      toScheme = Sanscript.schemes[to];

  for (let group in fromScheme) {
    if (!fromScheme.hasOwnProperty(group)) {
      continue;
    }
    let fromGroup = fromScheme[group],
        toGroup = toScheme[group];
    if (toGroup === undefined) {
      continue;
    }
    for (let i = 0; i < fromGroup.length; i++) {
      let F = fromGroup[i],
          T = toGroup[i],
          alts = alternates[F] || [],
          numAlts = alts.length,
          j = 0;

      tokenLengths.push(F.length);
      for (j = 0; j < numAlts; j++) {
        tokenLengths.push(alts[j].length);
      }

      if (group === 'vowel_marks' || group === 'virama') {
        marks[F] = T;
        for (j = 0; j < numAlts; j++) {
          marks[alts[j]] = T;
        }
      } else {
        letters[F] = T;
        for (j = 0; j < numAlts; j++) {
          letters[alts[j]] = T;
        }
        if (group === 'consonants' || group === 'other') {
          consonants[F] = T;

          for (j = 0; j < numAlts; j++) {
            consonants[alts[j]] = T;
          }
        }
      }
    }
  }

  return { consonants: consonants,
    fromRoman: Sanscript.isRomanScheme(from),
    letters: letters,
    marks: marks,
    maxTokenLength: Math.max.apply(Math, tokenLengths),
    toRoman: Sanscript.isRomanScheme(to),
    virama: toScheme.virama };
};

    /**
     * Transliterate from a romanized script.
     *
     * @param data     the string to transliterate
     * @param map      map data generated from makeMap()
     * @param options  transliteration options
     * @return         the finished string
     */
let transliterateRoman = function (data, map, options) {
  let buf = [],
      consonants = map.consonants,
      dataLength = data.length,
      hadConsonant = false,
      letters = map.letters,
      marks = map.marks,
      maxTokenLength = map.maxTokenLength,
      optSkipSGML = options.skip_sgml,
      optSyncope = options.syncope,
      tempLetter,
      tempMark,
      tokenBuffer = '',
      toRoman = map.toRoman,
      virama = map.virama;

        // Transliteration state. It's controlled by these values:
        // - `skippingSGML`: are we in SGML?
        // - `toggledTrans`: are we in a toggled region?
        //
        // We combine these values into a single variable `skippingTrans`:
        //
        //     `skippingTrans` = skippingSGML || toggledTrans;
        //
        // If (and only if) this value is true, don't transliterate.
  let skippingSGML = false,
      skippingTrans = false,
      toggledTrans = false;

  for (var i = 0, L; (L = data.charAt(i)) || tokenBuffer; i++) {
            // Fill the token buffer, if possible.
    let difference = maxTokenLength - tokenBuffer.length;
    if (difference > 0 && i < dataLength) {
      tokenBuffer += L;
      if (difference > 1) {
        continue;
      }
    }

            // Match all token substrings to our map.
    for (let j = 0; j < maxTokenLength; j++) {
      let token = tokenBuffer.substr(0, maxTokenLength - j);

      if (skippingSGML === true) {
        skippingSGML = (token !== '>');
      } else if (token === '<') {
        skippingSGML = optSkipSGML;
      } else if (token === '##') {
        toggledTrans = !toggledTrans;
        tokenBuffer = tokenBuffer.substr(2);
        break;
      }
      skippingTrans = skippingSGML || toggledTrans;
      if ((tempLetter = letters[token]) !== undefined && !skippingTrans) {
        if (toRoman) {
          buf.push(tempLetter);
        } else {
                        // Handle the implicit vowel. Ignore 'a' and force
                        // vowels to appear as marks if we've just seen a
                        // consonant.
          if (hadConsonant) {
            if ((tempMark = marks[token])) {
              buf.push(tempMark);
            } else if (token !== 'a') {
              buf.push(virama);
              buf.push(tempLetter);
            }
          } else {
            buf.push(tempLetter);
          }
          hadConsonant = token in consonants;
        }
        tokenBuffer = tokenBuffer.substr(maxTokenLength - j);
        break;
      } else if (j === maxTokenLength - 1) {
        if (hadConsonant) {
          hadConsonant = false;
          if (!optSyncope) {
            buf.push(virama);
          }
        }
        buf.push(token);
        tokenBuffer = tokenBuffer.substr(1);
                    // 'break' is redundant here, "j == ..." is true only on
                    // the last iteration.
      }
    }
  }
  if (hadConsonant && !optSyncope) {
    buf.push(virama);
  }
  return buf.join('');
};

    /**
     * Transliterate from a Brahmic script.
     *
     * @param data     the string to transliterate
     * @param map      map data generated from makeMap()
     * @param options  transliteration options
     * @return         the finished string
     */
let transliterateBrahmic = function (data, map, options) {
  let buf = [],
      consonants = map.consonants,
      danglingHash = false,
      hadRomanConsonant = false,
      letters = map.letters,
      marks = map.marks,
      temp,
      toRoman = map.toRoman,
      skippingTrans = false;

  for (var i = 0, L; (L = data.charAt(i)); i++) {
            // Toggle transliteration state
    if (L === '#') {
      if (danglingHash) {
        skippingTrans = !skippingTrans;
        danglingHash = false;
      } else {
        danglingHash = true;
      }
      if (hadRomanConsonant) {
        buf.push('a');
        hadRomanConsonant = false;
      }
      continue;
    } else if (skippingTrans) {
      buf.push(L);
      continue;
    }

    if ((temp = marks[L]) !== undefined) {
      buf.push(temp);
      hadRomanConsonant = false;
    } else {
      if (danglingHash) {
        buf.push('#');
        danglingHash = false;
      }
      if (hadRomanConsonant) {
        buf.push('a');
        hadRomanConsonant = false;
      }

                // Push transliterated letter if possible. Otherwise, push
                // the letter itself.
      if ((temp = letters[L])) {
        buf.push(temp);
        hadRomanConsonant = toRoman && (L in consonants);
      } else {
        buf.push(L);
      }
    }
  }
  if (hadRomanConsonant) {
    buf.push('a');
  }
  return buf.join('');
};

    /**
     * Transliterate from one script to another.
     *
     * @param data     the string to transliterate
     * @param from     the source script
     * @param to       the destination script
     * @param options  transliteration options
     * @return         the finished string
     */
Sanscript.t = function (data, from, to, options) {
  options = options || {};
  let cachedOptions = cache.options || {},
      defaults = Sanscript.defaults,
      hasPriorState = (cache.from === from && cache.to === to),
      map;

        // Here we simultaneously build up an `options` object and compare
        // these options to the options from the last run.
  for (let key in defaults) {
    if (defaults.hasOwnProperty(key)) {
      let value = defaults[key];
      if (key in options) {
        value = options[key];
      }
      options[key] = value;

                // This comparison method is not generalizable, but since these
                // objects are associative arrays with identical keys and with
                // values of known type, it works fine here.
      if (value !== cachedOptions[key]) {
        hasPriorState = false;
      }
    }
  }

  if (hasPriorState) {
    map = cache.map;
  } else {
    map = makeMap(from, to);
    cache = {
      from: from,
      map: map,
      options: options,
      to: to };
  }

        // Easy way out for "{\m+}", "\", and ".h".
  if (from === 'itrans') {
    data = data.replace(/\{\\m\+\}/g, '.h.N');
    data = data.replace(/\.h/g, '');
    data = data.replace(/\\([^'`_]|$)/g, '##$1##');
  }

  let alldata = '';
  if (map.fromRoman) {
    alldata = transliterateRoman(data, map, options);
  } else {
    alldata = transliterateBrahmic(data, map);
  }

        // Fix any remaining quotations for Vedic Accents
  if (to === 'devanagari' && options.enableSanskritVedicAccents === true) {
            //alldata = alldata.replace('\\"', "\u1CDA").replace('"', "\u1CDA").replace('&quot;', "\u1CDA");
    alldata = alldata.replace(/\\?"/g, '\u1CDA');
  } else if (!(to === 'itrans' || to === 'iast')) {
    alldata = alldata.replace(/\\?"/g, '');
  }

        // Enable Tamil Accents Support
  if (to === 'tamil' && options.enableTamilPronounciation === true) {
    alldata = alldata.replace(/(.)(²|³|⁴)(ா|ி|ீ|ு|ூ|ெ|ே|ை|ொ|ோ|ௌ|்)/g, '$1$3$2');
  }
  if (to === 'tamil' && options.enableTamilCharPositionFixes === true) {
    alldata = alldata
                .replace(/(^|\s+)(த|ந்|தை)/g, '$1ந$2')
                .replace(/([^\s])ந/g, '$1ன');
  }
  return alldata;
};

var sanscript = Sanscript;

const isInSanscriptSchemes = vtransScheme => [
  'bengali',
  'devanagari',
  'gujarati',
  'gurmukhi',
  'kannada',
  'malayalam',
  'oriya',
  'tamil',
  'telugu'
].indexOf(vtransScheme) > -1;

var markdownItAlerts = function vtrans_plugin(md, options) {
  md.use(markdownItContainer, 'vtrans', {
    render: function (tokens, idx) {
      const openingTag = 1;
      const isOpeningTag = tokens[idx].nesting === openingTag;
      const containerInfo = tokens[idx].info;
      const getScheme = containerInfo.match(/^\svtrans\s(.*)$/);
      const vtransScheme = (getScheme) ? getScheme[1] : '';

      if (isOpeningTag && isInSanscriptSchemes(vtransScheme)) {

        md.renderer.rules.text = (tokens, idx) =>
          `${sanscript.t(tokens[idx].content, 'itrans_dravidian', vtransScheme)}`;

        return `<div class="vtrans vtrans-${vtransScheme}">\n`;
      }
      return '</div>\n';

    }
  });

};

export default markdownItAlerts;
