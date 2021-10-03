let timeoutSaveStore = null;

document.addEventListener(
  'DOMContentLoaded',
  function () {
    getActiveTab((tab) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: checkRequirement,
        },
        (injectionResults) => {
          if (!injectionResults?.length) return;
          for (const frameResult of injectionResults) {
            const results = JSON.parse(frameResult.result || '{}');
            if (results?.length) {
              const checkIconClassName = 'fas fa-check status-icon--success';
              const uncheckIconClassName = 'fas fa-times status-icon--danger';
              const taskNameCheckIcon = document.getElementById(
                'cttf_task_name_check_icon',
              );
              const formInputCheckIcon = document.getElementById(
                'cttf_form_input_check_icon',
              );
              const btnFormat = document.getElementById('cttf_btn_format');

              taskNameCheckIcon.classList.remove(
                ...checkIconClassName.split(' '),
                ...uncheckIconClassName.split(' '),
              );
              formInputCheckIcon.classList.remove(
                ...checkIconClassName.split(' '),
                ...uncheckIconClassName.split(' '),
              );

              taskNameCheckIcon.classList.add(
                ...(!!results[0]
                  ? checkIconClassName.split(' ')
                  : uncheckIconClassName.split(' ')),
              );
              formInputCheckIcon.classList.add(
                ...(!!results[1]
                  ? checkIconClassName.split(' ')
                  : uncheckIconClassName.split(' ')),
              );

              btnFormat.classList[
                !!results[0] && !!results[1] ? 'remove' : 'add'
              ]('btn--disabled');
            }
          }
        },
      );
    });

    chrome.storage.sync.get('cttf_user_name', function (e) {
      let userName = e?.cttf_user_name || '';

      if (!userName) {
        getActiveTab((tab) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: updateDefaultUserName,
            },
            (injectionResults) => {
              if (!injectionResults?.length) return;

              for (const frameResult of injectionResults) {
                if (frameResult.result) {
                  document.getElementById('cttf_user_name').value =
                    frameResult.result;
                }
              }
            },
          );
        });
      } else {
        document.getElementById('cttf_user_name').value = userName;
      }
    });

    function checkRequirement() {
      const defaultTaskNameClassName = 'task-name__overlay';
      const defaultTaskNameInputClassName =
        'cu-git-integration-modal__form-item-input';

      let taskName = document.getElementsByClassName(
        defaultTaskNameClassName,
      )[0]?.textContent;
      const formInput = document.getElementsByClassName(
        defaultTaskNameInputClassName,
      )[0];

      return JSON.stringify([taskName, formInput]);
    }

    function getActiveTab(callback = () => {}) {
      chrome.tabs.query({ active: true }, function (tabs) {
        const tab = tabs[0];

        callback(tab);
      });
    }

    function updateDefaultUserName() {
      let userName = JSON.parse(
        localStorage.getItem('attr_user_traits') || '{}',
      )?.name;
      if (!!userName) {
        chrome.storage.sync.set({ cttf_user_name: userName });
        return userName;
      }
    }

    document
      .getElementById('cttf_user_name')
      .addEventListener('input', changeUserName);

    function changeUserName() {
      let value = this.value;
      chrome.storage.sync.set({ cttf_user_name: value }, () => {});
    }

    document
      .getElementById('cttf_chrome_shortcuts')
      .addEventListener('click', openChromeShortcuts);

    function openChromeShortcuts() {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    }

    document
      .getElementById('cttf_btn_format')
      .addEventListener('click', async () => {
        getActiveTab((tab) => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js'],
          });
        });
      });
  },
  false,
);
