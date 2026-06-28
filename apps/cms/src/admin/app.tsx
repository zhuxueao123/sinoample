import type { StrapiApp } from '@strapi/strapi/admin';
import { getPluginPresets } from '@_sh/strapi-plugin-ckeditor';

export default {
  config: {
    locales: ['zh-Hans', 'en'],
    notifications: {
      releases: false,
    },
    tutorials: false,
    translations: {
      'zh-Hans': {
        'Auth.form.register.subtitle': '账号仅用于登录 Sino Ample 内容管理后台。',
        'Auth.form.welcome.subtitle': '登录 Sino Ample 内容管理后台',
        'Auth.form.welcome.title': '欢迎使用 Sino Ample',
        'HomePage.header.subtitle': '管理网站内容、产品、解决方案和销售分配规则',
        'app.components.LeftMenu.navbrand.title': 'Sino Ample 后台',
        'app.components.LeftMenu.navbrand.workplace': '内容管理',
      },
      en: {
        'Auth.form.register.subtitle':
          'Credentials are only used to authenticate in the Sino Ample content management system.',
        'Auth.form.welcome.subtitle': 'Log in to the Sino Ample content management system',
        'Auth.form.welcome.title': 'Welcome to Sino Ample',
        'HomePage.header.subtitle': 'Manage website content, products, solutions, and sales routing',
        'app.components.LeftMenu.navbrand.title': 'Sino Ample Admin',
        'app.components.LeftMenu.navbrand.workplace': 'Content Management',
      },
    },
  },
  register() {
    const presets = getPluginPresets();
    if (presets.defaultHtml) {
      presets.defaultHtml.description = 'HTML rich text editor';
    }
  },
  bootstrap(_app: StrapiApp) {},
};
