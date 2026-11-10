const PROFANITY = /\b(?:fuck(?:ing)?|shit|bullshit|bitch(?:es)?|bastard|whore|slut|cunt|asshole|dumbass|motherfucker|kut|hoer|slet|tyfus|tering|klootzak|eikel|lul|flikker op)\b/i
const DISCRIMINATORY_SLURS = /\b(?:faggot|dyke|retard|nigger|nigga|mongool|flikker)\b/i
const TARGETED_INSULTS = /\b(?:you are|you re|jij bent|je bent|wat ben jij)\s+(?:a|an|een)?\s*(?:idiot|moron|stupid|loser|retard|faggot|dyke|flikker|debiel|mongool|idioot|sukkel|klootzak|eikel)\b/i
const BODY_SHAMING = /\b(?:dik(?:ke)?\s+(?:varken|zak|koe|wijf)|vet(?:te)?\s+(?:varken|zak|koe|wijf)|fat\s+(?:cow|pig|ass)|ugly\s+(?:body|cow)|lelijk\s+(?:lijf|lichaam|varken)|you are (?:fat|ugly)|you re (?:fat|ugly)|jij bent (?:dik|lelijk)|je bent lelijk)\b/i
const THREATS = /\b(?:ik maak je af|ik ga je (?:vermoorden|slaan|pijn doen)|kill yourself|i hope you die|i will (?:kill|hurt) you|i am going to (?:kill|hurt) you)\b/i
const DISORDER_INSTRUCTIONS = /\b(?:how to|how can i|how do i|tips? to|hoe (?:kan ik|moet ik)|tips? om)\s+(?:purge|throw up|make myself vomit|starve myself|hide that i(?:'m| am) not eating|overgeven|braken|uithongeren|eten verbergen)\b|\b(?:eat|eet)\s+(?:under|less than|minder dan)\s+\d{1,4}\s*(?:kcal|calories?|calorie[eë]n?)\b/i
const EATING_DISORDER_TERMS = /\b(?:eetstoornis(?:sen)?|anorex\w*|bulimi\w*|boulimi\w*|pro[- ]?ana|pro[- ]?mia|purging|binge eating|eating disorder(?:s)?)\b/i
const CANCER_WORD = /\b(?:kanker|cancer)\b/i
const CANCER_MEDICAL_CONTEXT = /\b(?:ik heb|ik had|heeft|diagnose|behandeling|behandeld|ziekenhuis|chemotherapie|chemo|tumor|pati[eë]nt|familie|moeder|vader|vriendin|herstel|overleden aan|i have|i had|diagnosed|treatment|hospital|chemotherapy|my mother|my father|my friend|recovery|died from)\b/i
const CANCER_SWEAR = /\bkanker(?:kut|hoer|wijf|lul|mongool|idioot|debiel|kop|bek|wijf)|kanker\s+(?:kut|hoer|wijf|lul|mongool|idioot|debiel|kop|bek)|kanker(?:goed|lekker|vet|mooi|dom|stom)\b/i

function normalizeForModeration(value) {
    return String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[a-z0-9@!|$]+/g, token => token.replace(/(?<=[a-z])[0-9@!|$](?=[a-z])/g, character => ({
            '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '!': 'i', '|': 'i', '$': 's'
        })[character]))
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\b(?:[a-z]\s+){2,}[a-z]\b/g, sequence => sequence.replace(/\s/g, ''))
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Classifies user-generated community text before it is made public.
 * Sensitive-topic matches are held for a human review; explicit abuse and
 * harmful instructions are rejected. Neutral medical mentions are allowed.
 */
export function moderateCommunityText(value) {
    const text = normalizeForModeration(value)

    if (!text) return { action: 'allow' }

    if (PROFANITY.test(text) || DISCRIMINATORY_SLURS.test(text) || TARGETED_INSULTS.test(text) || BODY_SHAMING.test(text) || THREATS.test(text) || CANCER_SWEAR.test(text)) {
        return { action: 'reject', reason: 'community_guidelines' }
    }

    if (DISORDER_INSTRUCTIONS.test(text)) {
        return { action: 'reject', reason: 'harmful_health_advice' }
    }

    if (CANCER_WORD.test(text) && !CANCER_MEDICAL_CONTEXT.test(text)) {
        return { action: 'review', reason: 'sensitive_language' }
    }

    if (EATING_DISORDER_TERMS.test(text)) {
        return { action: 'review', reason: 'sensitive_health_topic' }
    }

    return { action: 'allow' }
}

export function moderateCommunityContent(...parts) {
    const decisions = parts.map(moderateCommunityText)
    const rejection = decisions.find(decision => decision.action === 'reject')
    if (rejection) return rejection

    const review = decisions.find(decision => decision.action === 'review')
    if (review) return review

    return { action: 'allow' }
}
