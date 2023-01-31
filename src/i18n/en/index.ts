import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
  test: 'This is a home page.',

  header: {
    now_lang: 'English',
    lang_sel: {
      ja: {
        main_name: '日本語',
        sub_name: 'Japanese',
      },
      en: {
        main_name: 'English',
        sub_name: 'English',
      },
    },
  },

  side_menu: {
    entry: {
      title: 'Sign Up',
      contents: {
        acccreate: 'Account Creation Procedure',
        acclink: 'Account Linking Procedure',
      },
    },
    begin: {
      title: 'Starting the Game',
      contents: {
        start: 'How to Start the Game',
        menu: 'Title Menu',
        character: 'Character Creation',
        adddelete: 'Adding and Deleting Characters',
        world: 'World Selection',
        tutorial: 'Tutorial',
        multiple: 'Multiple Launch of the Game',
        quit: 'Quit the Game',
      },
    },
    server: {
      title: 'Discord Features',
      contents: {
        bounty: 'Bounty System',
        gacha: 'Gacha System',
        market: 'Marketplace',
        command: 'Slash Command',
      },
    },
  },
};

export default en;
