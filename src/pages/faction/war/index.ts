import './faction-war.css';

import xhook from 'xhook';

import { errorToString, getTSCSpyOld } from '../../../utils/api.js';
import { waitForElement } from '../../../utils/dom.js';
import { formatSpyLong } from '../../../utils/format.js';
import Settings from '../../../utils/local-storage.js';
import Logger from '../../../utils/logger.js';
import Page from '../../page.js';

const ID_HREF_SELECTOR = 'a[href^="/profiles.php?XID="]';
const INFO_BOX_SELECTOR = '[class*="userInfoBox"]';
const MEMBER_SELECTOR = 'div.member.icons.left';

export const FactionWar = new Page({
  name: 'Faction - War',
  description: 'Shows spies on the faction war page',

  shouldRun: async function () {
    return Settings.getToggle(this.name) && window.location.href.includes('factions.php?step=');
  },

  start: async function () {
    xhook.after(async (request, _response) => {
      if (request.url.includes('faction_wars.php?redirect=false&step=getwarusers&') === false) {
        return;
      }
      const user = await waitForElement(MEMBER_SELECTOR, 10_000);

      if (!user) {
        Logger.error(`${this.name}: Could not find users`);
        return;
      }

      $(MEMBER_SELECTOR).each((_index, element) => {
        const userHref = $(element).find<HTMLAnchorElement>(ID_HREF_SELECTOR)[0];

        if (!userHref) {
          Logger.error(`${this.name}: Could not find the user's Href`);
          return;
        }

        const userId = userHref.href.split('XID=')[1];

        if (!userId) {
          Logger.error(`${this.name}: Could not find the user's ID`);
          return;
        }

        const member = $(element).find<HTMLDivElement>(INFO_BOX_SELECTOR)[0];

        if (!member) {
          Logger.debug(`${this.name}: Could not find member's info box.`);
          return;
        }

        const parentDiv = $('<div>').addClass('tsc-faction-war');
        parentDiv.append($('<img>').addClass('tsc-loader'));

        $(element).parent().append(parentDiv);

        getTSCSpyOld(userId).then(spy => {
          parentDiv.empty();

          if ('error' in spy || spy.success !== true) {
            Logger.warn(`${this.name}: Failed to find spy for ${userId}`, spy);

            if ('error' in spy) {
              $(parentDiv).append($('<span>').text(spy.message));
            } else {
              $(parentDiv).append($('<span>').text(errorToString(spy.code)));
            }

            return;
          }

          const { longTextInterval, longTextEstimate, toolTipText } = formatSpyLong(spy);

          parentDiv.attr('title', toolTipText).append($('<span>').text(longTextEstimate));

          if (longTextInterval !== '') {
            $(parentDiv).append($('<span>').text(longTextInterval));
          }

          $(element).parent().append(parentDiv);
        });
      });
    });
  },
});