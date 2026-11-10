import { moderateCommunityText, moderateCommunityContent } from '../src/logic/community-moderation.js'

const cases = [
    ['ordinary support is allowed', 'Ik heb vandaag weinig energie en zoek tips om rustig te bewegen.', 'allow'],
    ['direct profanity is rejected', 'You are a bitch.', 'reject'],
    ['spaced-out profanity is rejected', 'F u c k you.', 'reject'],
    ['direct insults are rejected', 'You are an idiot.', 'reject'],
    ['discriminatory insults are rejected', 'You are a faggot.', 'reject'],
    ['standalone discriminatory slurs are rejected', 'Retard.', 'reject'],
    ['body shaming is rejected', 'Je bent een dik varken.', 'reject'],
    ['a threat is rejected', 'Ik maak je af.', 'reject'],
    ['harmful eating-disorder instructions are rejected', 'How do I purge without anyone knowing?', 'reject'],
    ['a low-calorie restriction instruction is rejected', 'Eet minder dan 500 kcal per dag.', 'reject'],
    ['an eating-disorder support post is held for review', 'Ik herstel van anorexia en zoek steun.', 'review'],
    ['neutral cancer support is allowed', 'Ik heb kanker en zoek steun.', 'allow'],
    ['the cancer slur is rejected', 'Je bent een kankerhoer.', 'reject'],
    ['cancer used as a swear intensifier is rejected', 'Dat is kankergoed.', 'reject'],
    ['ambiguous standalone cancer profanity is held for review', 'Kanker!', 'review']
]

let failures = 0
for (const [description, text, expected] of cases) {
    const actual = moderateCommunityText(text).action
    if (actual !== expected) {
        failures++
        console.error(`❌ ${description}: expected ${expected}, received ${actual}`)
    } else {
        console.log(`✅ ${description}`)
    }
}

const combined = moderateCommunityContent('Een fijne vraag', 'Ik herstel van boulimia en zoek steun.')
if (combined.action !== 'review') {
    failures++
    console.error(`❌ combined post content should be held for review, received ${combined.action}`)
} else {
    console.log('✅ combined title and body are both moderated')
}

if (failures > 0) process.exit(1)
console.log(`\nCommunity moderation tests passed: ${cases.length + 1}`)
