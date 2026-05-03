import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * LegalT namespace class - represents the legal-page translations structure
 * (terms, privacy policy, data deletion).
 */
export class LegalT implements Translation {
  namespace?: keyof FullTranslation = 'legal'

  common = {
    lastUpdated: '',
    terms: '',
    privacy: '',
    dataDeletion: '',
  }

  terms = {
    title: '',
    intro: '',
    useTitle: '',
    useBody: '',
    contentTitle: '',
    contentBody: '',
    disclaimerTitle: '',
    disclaimerBody: '',
    changesTitle: '',
    changesBody: '',
    contactTitle: '',
    contactBody: '',
  }

  privacy = {
    title: '',
    intro: '',
    collectTitle: '',
    collectAccount: '',
    collectAuth: '',
    collectAnalytics: '',
    useTitle: '',
    useBody: '',
    sharingTitle: '',
    sharingBody: '',
    cookiesTitle: '',
    cookiesBody: '',
    rightsTitle: '',
    rightsBody: '',
    retentionTitle: '',
    retentionBody: '',
    contactTitle: '',
    contactBody: '',
  }

  dataDeletion = {
    title: '',
    intro: '',
    howTitle: '',
    howStep1: '',
    howStep2: '',
    howStep3: '',
    whatTitle: '',
    whatItem1: '',
    whatItem2: '',
    whatItem3: '',
    whatNote: '',
    timeframeTitle: '',
    timeframeBody: '',
    facebookTitle: '',
    facebookBody: '',
  }

  dataDeletionStatus = {
    title: '',
    body: '',
    codeLabel: '',
    contact: '',
  }
}
