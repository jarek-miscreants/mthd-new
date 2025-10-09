import {card} from './card'
import {homePage} from './homePage'
import {companyPage} from './companyPage'
import {contactPage} from './contactPage'
import {productsOverviewPage} from './productsOverviewPage'
import {product} from './product'
import {siteSettings} from './siteSettings'
import {seo} from './seo'
import {legalPage} from './legalPage'

export const schemaTypes = [
  // object types
  card,
  seo,
  // docuement types
  homePage,
  companyPage,
  contactPage,
  productsOverviewPage,
  product,
  siteSettings,
  legalPage,
]
