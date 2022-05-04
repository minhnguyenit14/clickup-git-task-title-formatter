chrome.storage.sync.get('cttf_user_name', function (e) {
  let userName = e?.cttf_user_name;

  chrome.storage.sync.get('cttf_task_folder', function (e) {
    let taskFolder = e?.cttf_task_folder;

    chrome.storage.sync.get('cttf_task_code', function (e) {
      let taskCode = e?.cttf_task_code;

      format({ userName, taskFolder, taskCode });
    });
  });
});

function format(
  { userName, taskFolder, taskCode },
  taskNameClassName,
  taskNameInputClassName,
  taskDescriptionTextareaClassName,
) {
  const defaultTaskNameClassName = 'task-name__overlay';
  const defaultTaskNameInputClassName =
    'cu-git-integration-modal__form-item-input';
  const defaultTaskDescriptionTextareaClassName =
    'cu-git-integration-modal__form-item-textarea';

  !taskNameClassName && (taskNameClassName = defaultTaskNameClassName);
  !taskNameInputClassName &&
    (taskNameInputClassName = defaultTaskNameInputClassName);
  !taskDescriptionTextareaClassName &&
    (taskDescriptionTextareaClassName =
      defaultTaskDescriptionTextareaClassName);

  let taskName =
    document.getElementsByClassName(taskNameClassName)[0]?.textContent;
  const formInput = document.getElementsByClassName(taskNameInputClassName)[0];
  const formDescription = document.getElementsByClassName(
    taskDescriptionTextareaClassName,
  )[0];

  const showErrorModal = () => {
    let timeout = null;

    const errorListContent = document.createElement('ul');
    errorListContent.className = 'cttf_error-content-list';

    const createHighlightContent = (content) => {
      const errorHighlightContent = document.createElement('li');
      errorHighlightContent.append('DOM Element containing class: ');

      const errorHighlightMainContent = document.createElement('span');
      errorHighlightMainContent.append(content);

      errorHighlightContent.append(errorHighlightMainContent);

      return errorHighlightContent;
    };

    if (!taskName && !formInput) {
      errorListContent.append(createHighlightContent(defaultTaskNameClassName));
      errorListContent.append(
        createHighlightContent(defaultTaskNameInputClassName),
      );
    } else {
      errorListContent.append(
        createHighlightContent(
          !taskName ? defaultTaskNameClassName : defaultTaskNameInputClassName,
        ),
      );
    }

    const container = document.createElement('div');
    container.className = 'cttf_error-container';
    container.innerHTML = `
    <div class="cttf_error-title">
      Requirements not match</div>
    <div class="cttf_error-content-container">
      <div class="cttf_error-content-text">
      Missing: 
      ${errorListContent.outerHTML}
      </div>
    </div>
      `;

    const removeContainer = () => {
      clearTimeout(timeout);
      container.style.opacity = '0';
      container.style.right = '-20%';
      timeout = setTimeout(() => {
        document.body.removeChild(container);
      }, 300);
    };

    container.addEventListener('click', removeContainer);
    container.addEventListener(
      'mousedown',
      () => (container.style.backgroundColor = '#f0f0f0'),
    );
    container.addEventListener(
      'mouseup',
      () => (container.style.backgroundColor = '#fff'),
    );

    document.body.append(container);
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.right = '15px';
    }, 200);

    timeout = setTimeout(removeContainer, 5000);
  };

  showToast = (message) => {
    let timeout = null;

    const container = document.createElement('div');
    container.className = 'cttf_toast-container';
    container.innerHTML = `
    <div class="cttf_toast-content-container">
      ${message}
    </div>
    `;

    const removeContainer = () => {
      clearTimeout(timeout);
      container.style.opacity = '0';
      timeout = setTimeout(() => {
        document.body.removeChild(container);
      }, 300);
    };

    container.addEventListener('click', removeContainer);

    document.body.append(container);
    setTimeout(() => {
      container.style.opacity = '1';
      timeout = setTimeout(removeContainer, 3000);
    }, 200);
  };

  if (!taskName || !formInput) {
    showErrorModal();
    return;
  }

  const vi2en = (viString) => {
    return viString
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/g, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/Á|À|Ả|Ạ|Ã|Ă|Ắ|Ằ|Ẳ|Ẵ|Ạ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ/g, 'A')
      .replace(/É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ/g, 'E')
      .replace(/Í|Ì|Ỉ|Ĩ|Ị/g, 'I')
      .replace(/Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ/g, 'O')
      .replace(/Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự/g, 'U')
      .replace(/Ý|Ỳ|Ỷ|Ỹ|Ỵ/g, 'Y')

      .replace(/Đ/g, 'D');
  };

  const formatTaskString = (taskString = '') => {
    taskString = vi2en(taskString);

    const taskStringElements = taskString.split(' ');
    taskStringElements.forEach(
      (_, index) =>
        (taskStringElements[index] = taskStringElements[index].replace(
          /\W/g,
          '',
        )),
    );
    taskString = taskStringElements.join('-');

    return taskString;
  };

  const taskId =
    document
      .querySelectorAll('[data-task-id]')?.[0]
      ?.getAttribute('data-task-id') ||
    window.location.href.split('/').reverse()[0];

  taskName = formatTaskString(taskName);

  userName = formatTaskString(userName);

  taskName =
    (taskFolder ? taskFolder + '/' : '') +
    ((taskCode || 'CU') + '-') +
    taskId +
    (taskName ? '_' + taskName : '') +
    (userName ? '_' + userName : '');

  if (formInput) {
    formInput.classList.remove('cttf_text-highlight');
    formInput.classList.add('cttf_text-highlight');
    formInput.value = taskName;
    formInput.dispatchEvent(new Event('input'));
    const gitCmd = 'git checkout -b ' + taskName;
    const gitCmdMessage = 'copied ' + gitCmd;
    navigator.clipboard.writeText(gitCmd);
    showToast(gitCmdMessage);

    if (formDescription) {
      formDescription.value = taskName;
      formDescription.dispatchEvent(new Event('input'));
    }
  }
}
