'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();
  initTaskList();
  initModal();
  initDropdowns();
  initDatePicker();
  initAttachments();
  initCreateProjectForm();
  initProjectOverview();
  initSearch();
  initNotifications();
});

// Task data store — used by openModal to populate the modal
const TASKS = {
  '1': {
    title: 'Finalize Dashboard Widget Layouts',
    type: 'design',
    status: 'In Progress',
    assignee: 'Sarah Jenkins',
    due: '2023-10-24',
    description: "We need to refine the layout for the main analytics widgets on the dashboard. Ensure that the typography aligns with the new 'Editorial Authority' guidelines, specifically using tight letter-spacing for the headline numbers.\n\nPlease review the attached Figma file for spacing references.",
    attachments: [{ name: 'dashboard-v2-final.png', size: '2.4 MB' }],
    added: 'Added 2 days ago'
  },
  '2': {
    title: 'Implement Authentication Flow',
    type: 'dev',
    status: 'In Progress',
    assignee: 'Marcus Chen',
    due: '2023-10-26',
    description: 'Build the OAuth2 login flow and session management. Cover email/password and Google SSO paths.',
    attachments: [],
    added: 'Added 3 days ago'
  },
  '3': {
    title: 'QA Sprint 4 User Flows',
    type: 'qa',
    status: 'To Do',
    assignee: 'Priya Nair',
    due: '2023-10-28',
    description: 'Complete regression testing on all Sprint 4 flows. Log issues in Jira.',
    attachments: [],
    added: 'Added 1 day ago'
  },
  '4': {
    title: 'Write Release Notes v4.2',
    type: 'content',
    status: 'To Do',
    assignee: 'Tom Walsh',
    due: '2023-10-29',
    description: 'Document all new features and bug fixes for the v4.2 release.',
    attachments: [],
    added: 'Added today'
  },
  '5': {
    title: 'Design Review — Mobile Screens',
    type: 'review',
    status: 'In Progress',
    assignee: 'Sarah Jenkins',
    due: '2023-10-30',
    description: 'Review and sign off on all mobile breakpoint designs in Figma.',
    attachments: [],
    added: 'Added 4 days ago'
  }
};

let currentTaskId = null;

// Handles all sidebar navigation and page switching
function initSidebarNav() {
  const sidebarNavItems = document.querySelectorAll('#sidebar .nav-item');
  const btnNewProject = document.getElementById('btn-new-project');
  const btnCancelProject = document.getElementById('btn-cancel-project');

  if (sidebarNavItems) {
    sidebarNavItems.forEach(navItem => {
      navItem.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = navItem.getAttribute('data-page');
        if (pageName) {
          switchToPage(pageName, navItem);
        }
      });
    });
  }

  if (btnNewProject) {
    btnNewProject.addEventListener('click', (e) => {
      e.preventDefault();
      switchToPage('create-project', null);
    });
  }

  if (btnCancelProject) {
    btnCancelProject.addEventListener('click', (e) => {
      e.preventDefault();
      const projectsNavItem = document.querySelector('[data-page="projects"]');
      switchToPage('projects', projectsNavItem);
    });
  }

  function switchToPage(pageName, activeNavItem) {
    const allNavItems = document.querySelectorAll('#sidebar .nav-item');
    if (allNavItems) {
      allNavItems.forEach(item => item.classList.remove('nav-item--active'));
    }

    if (activeNavItem) {
      activeNavItem.classList.add('nav-item--active');
    }

    const allPages = document.querySelectorAll('.page');
    if (allPages) {
      allPages.forEach(page => page.classList.remove('active-page'));
    }

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
      targetPage.classList.add('active-page');
    }
  }
}

// Makes task rows interactive
function initTaskList() {
  const taskRows = document.querySelectorAll('.task-row');

  if (taskRows) {
    taskRows.forEach(row => {
      row.addEventListener('click', (e) => {
        const checkboxTarget = e.target.closest('.task-checkbox');
        if (checkboxTarget) {
          checkboxTarget.classList.toggle('checked');
          row.classList.toggle('task-done');
          return;
        }

        const taskId = row.dataset.taskId;
        if (taskId) {
          console.log('opening task: ' + taskId);
          openModal(taskId);
        }
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const taskId = row.getAttribute('data-task-id');
          if (taskId) {
            openModal(taskId);
          }
        }
      });
    });
  }
}

// Populates and opens the task detail modal
function openModal(taskId) {
  const task = TASKS[taskId];
  if (!task) return;

  currentTaskId = taskId;

  const modalBadge = document.getElementById('modal-badge');
  const modalDateAdded = document.getElementById('modal-date-added');
  const modalTitle = document.getElementById('modal-title');
  const modalStatusText = document.getElementById('modal-status-text');
  const modalAssigneeText = document.getElementById('modal-assignee-text');
  const modalDueText = document.getElementById('modal-due-text');
  const modalDescription = document.getElementById('modal-description');
  const statusDot = document.querySelector('.status-dot');
  const attachList = document.getElementById('attach-list');
  const modalOverlay = document.getElementById('modal-overlay');

  if (modalBadge) {
    modalBadge.textContent = task.type;
  }

  if (modalDateAdded) {
    modalDateAdded.textContent = task.added;
  }

  if (modalTitle) {
    modalTitle.textContent = task.title;
  }

  if (modalStatusText) {
    modalStatusText.textContent = task.status;
  }

  if (modalAssigneeText) {
    modalAssigneeText.textContent = task.assignee;
  }

  if (modalDescription) {
    modalDescription.value = task.description;
  }

  if (statusDot) {
    statusDot.setAttribute('data-status', task.status);
  }

  if (modalDueText) {
    const dueDate = new Date(task.due + 'T00:00:00');
    const formattedDate = dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    modalDueText.textContent = formattedDate;
  }

  if (attachList) {
    attachList.innerHTML = '';
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach(attachment => {
        const attachItem = document.createElement('div');
        attachItem.className = 'attach-item';
        attachItem.innerHTML = `
          <div class="attach-icon">📄</div>
          <div>
            <div class="attach-name">${attachment.name}</div>
            <div class="attach-size">${attachment.size}</div>
          </div>
        `;
        attachList.appendChild(attachItem);
      });
    }
  }

  if (modalOverlay) {
    modalOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      modalOverlay.classList.add('visible');
    });
  }

  document.body.style.overflow = 'hidden';
}

// Sets up modal close behaviour
function initModal() {
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalOverlay = document.getElementById('modal-overlay');

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-overlay');
      if (overlay && overlay.classList.contains('visible')) {
        closeModal();
      }
    }
  });
}

// Closes the modal with animation
function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modalOverlay) return;

  modalOverlay.classList.remove('visible');

  setTimeout(() => {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, 200);

  currentTaskId = null;
}

// Handles the Status and Assignee custom dropdowns inside the modal
function initDropdowns() {
  const fieldSelects = document.querySelectorAll('.field-select');

  if (fieldSelects) {
    fieldSelects.forEach(select => {
      const dropdownId = select.getAttribute('data-open');
      if (!dropdownId) return;

      select.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
          const shouldOpen = !dropdown.classList.contains('open');
          closeAllDropdowns();
          if (shouldOpen) {
            dropdown.classList.add('open');
          }
        }
      });

      const dropdown = document.getElementById(dropdownId);
      if (dropdown) {
        const items = dropdown.querySelectorAll('li');
        if (items) {
          items.forEach(item => {
            item.addEventListener('click', (e) => {
              e.stopPropagation();
              const value = item.getAttribute('data-value');

              if (select.id === 'modal-status-btn') {
                const statusText = document.getElementById('modal-status-text');
                if (statusText && value) {
                  statusText.textContent = value;
                }
                const statusDot = select.querySelector('.status-dot');
                if (statusDot && value) {
                  statusDot.setAttribute('data-status', value);
                }
              } else if (select.id === 'modal-assignee-btn') {
                const assigneeText = document.getElementById('modal-assignee-text');
                if (assigneeText && value) {
                  assigneeText.textContent = value;
                }
              }

              dropdown.classList.remove('open');
            });
          });
        }
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.field-select')) {
      closeAllDropdowns();
    }
  });

  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    if (dropdowns) {
      dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
    }
  }
}

// Makes the Due Date field open the native date input
function initDatePicker() {
  const modalDueBtn = document.getElementById('modal-due-btn');
  const modalDueInput = document.getElementById('modal-due-input');

  if (modalDueBtn && modalDueInput) {
    modalDueBtn.addEventListener('click', () => {
      if (modalDueInput.showPicker) {
        modalDueInput.showPicker();
      } else {
        modalDueInput.click();
      }
    });
  }

  if (modalDueInput) {
    modalDueInput.addEventListener('change', () => {
      const value = modalDueInput.value;
      if (value) {
        const dueDate = new Date(value + 'T00:00:00');
        const formattedDate = dueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const modalDueText = document.getElementById('modal-due-text');
        if (modalDueText) {
          modalDueText.textContent = formattedDate;
        }
      }
    });
  }
}

// Helper function to format file size in human-readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (sizes[i] === 'MB' || sizes[i] === 'GB') {
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

// Handles file attachment UI
function initAttachments() {
  const attachAddBtn = document.getElementById('attach-add-btn');
  const attachFileInput = document.getElementById('attach-file-input');

  if (attachAddBtn && attachFileInput) {
    attachAddBtn.addEventListener('click', () => {
      attachFileInput.click();
    });
  }

  if (attachFileInput) {
    attachFileInput.addEventListener('change', (e) => {
      const attachList = document.getElementById('attach-list');
      if (!attachList) return;

      const files = e.target.files;
      if (files) {
        Array.from(files).forEach(file => {
          const attachItem = document.createElement('div');
          attachItem.className = 'attach-item';
          const fileSize = formatFileSize(file.size);
          attachItem.innerHTML = `
            <div class="attach-icon">📄</div>
            <div>
              <div class="attach-name">${file.name}</div>
              <div class="attach-size">${fileSize}</div>
            </div>
          `;
          attachList.appendChild(attachItem);
        });
      }

      attachFileInput.value = '';
    });
  }
}

// Full form logic for the Create Project page
function initCreateProjectForm() {
  const createProjectForm = document.getElementById('create-project-form');
  const projName = document.getElementById('proj-name');
  const projCategory = document.getElementById('proj-category');
  const projStart = document.getElementById('proj-start');
  const projEnd = document.getElementById('proj-end');
  const projDesc = document.getElementById('proj-desc');
  const inviteEmail = document.getElementById('invite-email');
  const btnAddMember = document.getElementById('btn-add-member');
  const memberChips = document.getElementById('member-chips');
  const errName = document.getElementById('err-name');
  const errDate = document.getElementById('err-date');
  const errEmail = document.getElementById('err-email');
  const btnCreateLg = document.querySelector('.btn-create-lg');
  const apiClient = window.ProjexaAPI;

  if (!createProjectForm) return;

  // Helper function to update progress bar
  function updateProgress() {
    const progressFill = document.getElementById('form-progress');
    if (!progressFill) return;

    let filled = 0;

    if (projName && projName.value.trim() !== '') filled++;
    if (projCategory && projCategory.value !== '') filled++;
    if (projStart && projStart.value !== '') filled++;
    if (projEnd && projEnd.value !== '') filled++;
    if (projDesc && projDesc.value.trim() !== '') filled++;
    if (document.querySelectorAll('#member-chips .chip').length > 0) filled++;

    const percentage = Math.round(filled / 6 * 100);
    document.getElementById('form-progress').style.width = percentage + '%';
  }

  // Attach progress bar update listeners
  if (projName) {
    projName.addEventListener('input', updateProgress);
  }

  if (projCategory) {
    projCategory.addEventListener('input', updateProgress);
  }

  if (projStart) {
    projStart.addEventListener('input', updateProgress);
  }

  if (projEnd) {
    projEnd.addEventListener('input', updateProgress);
  }

  if (projDesc) {
    projDesc.addEventListener('input', updateProgress);
  }

  // Helper function to add a member chip
  function addMember() {
    if (!inviteEmail || !memberChips || !errEmail) return;

    const email = inviteEmail.value.trim();

    if (!email.match(/.+@.+\..+/)) {
      if (errEmail) {
        errEmail.textContent = 'Please enter a valid email';
      }
      if (inviteEmail) {
        inviteEmail.classList.add('error');
      }
      return;
    }

    const existingChips = memberChips.querySelectorAll('.chip');
    for (let chip of existingChips) {
      const chipEmail = chip.getAttribute('data-email');
      if (chipEmail === email) {
        if (errEmail) {
          errEmail.textContent = 'Already added';
        }
        if (inviteEmail) {
          inviteEmail.classList.add('error');
        }
        return;
      }
    }

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.setAttribute('data-email', email);
    chip.innerHTML = `
      <div class="chip-avatar"></div>
      <span>${email}</span>
      <button class="chip-remove" data-email="${email}" type="button">&times;</button>
    `;

    memberChips.appendChild(chip);

    const removeBtn = chip.querySelector('.chip-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        chip.remove();
        updateProgress();
      });
    }

    inviteEmail.value = '';
    if (errEmail) {
      errEmail.textContent = '';
    }
    if (inviteEmail) {
      inviteEmail.classList.remove('error');
    }
    updateProgress();
  }

  // Attach member button listener
  if (btnAddMember) {
    btnAddMember.addEventListener('click', addMember);
  }

  if (memberChips) {
    memberChips.addEventListener('click', (e) => {
      const removeButton = e.target.closest('.chip-remove');
      if (removeButton) {
        const chip = removeButton.closest('.chip');
        if (chip) {
          chip.remove();
          updateProgress();
        }
      }
    });
  }

  // Allow Enter key to add member
  if (inviteEmail) {
    inviteEmail.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMember();
      }
    });
  }

  // Helper function to validate dates
  function validateDates() {
    if (!projStart || !projEnd || !errDate) return;

    if (projStart.value && projEnd.value) {
      const startDate = new Date(projStart.value + 'T00:00:00');
      const endDate = new Date(projEnd.value + 'T00:00:00');

      if (endDate < startDate) {
        if (errDate) {
          errDate.textContent = 'End date must be after start date';
        }
        if (projEnd) {
          projEnd.classList.add('error');
        }
        return true;
      }
    }
    return false;
  }

  // Date validation on blur
  if (projEnd) {
    projEnd.addEventListener('blur', validateDates);

    projEnd.addEventListener('change', () => {
      if (errDate) {
        errDate.textContent = '';
      }
      if (projEnd) {
        projEnd.classList.remove('error');
      }
    });
  }

  // Form submit handler
  createProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate project name
    if (projName && !projName.value.trim()) {
      if (errName) {
        errName.textContent = 'Project name is required';
      }
      if (projName) {
        projName.classList.add('error');
      }
      isValid = false;
    } else {
      if (errName) {
        errName.textContent = '';
      }
      if (projName) {
        projName.classList.remove('error');
      }
    }

    // Validate dates
    if (validateDates()) {
      isValid = false;
    }

    if (!isValid) return;

    if (!apiClient) {
      if (errName) {
        errName.textContent = 'Backend API is not available.';
      }
      return;
    }

    const memberEmails = memberChips
      ? Array.from(memberChips.querySelectorAll('.chip')).map((chip) => chip.getAttribute('data-email')).filter(Boolean)
      : [];

    const projectPayload = {
      name: projName ? projName.value.trim() : '',
      category: projCategory ? projCategory.value : '',
      startDate: projStart ? projStart.value : '',
      endDate: projEnd ? projEnd.value : '',
      description: projDesc ? projDesc.value.trim() : '',
      members: memberEmails
    };

    const originalButtonLabel = btnCreateLg ? btnCreateLg.textContent : 'Create Project';

    if (btnCreateLg) {
      btnCreateLg.textContent = 'Saving...';
      btnCreateLg.disabled = true;
    }

    try {
      const token = sessionStorage.getItem('projexa.token');
      await apiClient.request('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(projectPayload)
      });

      if (btnCreateLg) {
        btnCreateLg.textContent = 'Project Created!';
      }

      setTimeout(() => {
        // Navigate back to projects page
        const projectsNavItem = document.querySelector('[data-page="projects"]');
        const sidebarNavItems = document.querySelectorAll('#sidebar .nav-item');

        if (sidebarNavItems) {
          sidebarNavItems.forEach(item => item.classList.remove('nav-item--active'));
        }

        if (projectsNavItem) {
          projectsNavItem.classList.add('nav-item--active');
        }

        const allPages = document.querySelectorAll('.page');
        if (allPages) {
          allPages.forEach(page => page.classList.remove('active-page'));
        }

        const projectsPage = document.getElementById('page-projects');
        if (projectsPage) {
          projectsPage.classList.add('active-page');
        }

        // Reset form
        createProjectForm.reset();
        const progressFill = document.getElementById('form-progress');
        if (progressFill) {
          progressFill.style.width = '0%';
        }
        if (memberChips) {
          memberChips.innerHTML = '';
        }

        // Reset button
        if (btnCreateLg) {
          btnCreateLg.textContent = originalButtonLabel;
          btnCreateLg.disabled = false;
        }
      }, 1200);
    } catch (error) {
      if (errName) {
        errName.textContent = error.message || 'Unable to save the project right now.';
      }

      if (btnCreateLg) {
        btnCreateLg.textContent = originalButtonLabel;
        btnCreateLg.disabled = false;
      }
    }
  });

  updateProgress();
}

// Renders all projects from the backend into the projects page
function initProjectOverview() {
  const apiClient = window.ProjexaAPI;
  const projectTitle = document.querySelector('.project-title');
  const projectMeta = document.querySelector('.project-meta');

  if (!apiClient || !projectTitle || !projectMeta) return;

  apiClient.request('/api/projects')
    .then((response) => {
      if (!response || !Array.isArray(response.projects) || response.projects.length === 0) {
        projectTitle.textContent = 'No Projects Yet';
        projectMeta.textContent = 'Create your first project to get started';
        return;
      }

      const latestProject = response.projects[0];
      projectTitle.textContent = latestProject.name || projectTitle.textContent;

      const memberCount = Array.isArray(latestProject.members) ? latestProject.members.length : 0;
      const category = latestProject.category ? latestProject.category.toUpperCase() : 'Saved Project';
      projectMeta.textContent = memberCount > 0 ? `${category} · ${memberCount} member${memberCount === 1 ? '' : 's'}` : category;

      // Render all projects list
      const pageProjects = document.getElementById('page-projects');
      let projectsList = document.getElementById('projects-list-container');
      
      if (!projectsList && pageProjects) {
        projectsList = document.createElement('div');
        projectsList.id = 'projects-list-container';
        projectsList.style.cssText = 'margin-bottom: 30px;';
        const projectHeader = pageProjects.querySelector('.project-header');
        if (projectHeader) {
          projectHeader.parentNode.insertBefore(projectsList, projectHeader);
        }
      }

      if (projectsList) {
        projectsList.innerHTML = '<h3 style="margin-bottom: 15px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #666;">All Projects</h3>';
        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;';
        
        response.projects.forEach((project) => {
          const card = document.createElement('div');
          card.style.cssText = 'padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; cursor: pointer; transition: all 0.2s;';
          card.onmouseover = () => card.style.cssText += 'background: #f0f0f0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
          card.onmouseout = () => card.style.cssText = 'padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; cursor: pointer; transition: all 0.2s;';
          
          const memberCount = Array.isArray(project.members) ? project.members.length : 0;
          const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
          const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
          
          card.innerHTML = `
            <div style="margin-bottom: 10px;">
              <h4 style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #222;">${project.name}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">${project.category || 'Project'}</p>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
              <div>${startDate} → ${endDate}</div>
              <div>${memberCount} member${memberCount === 1 ? '' : 's'}</div>
            </div>
            ${project.description ? `<p style="margin: 0; font-size: 12px; color: #666; line-height: 1.4;">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>` : ''}
          `;
          
          listContainer.appendChild(card);
        });
        
        projectsList.appendChild(listContainer);
      }
    })
    .catch(() => {
      // Keep the default header if the backend is unavailable.
    });
}

// Live search filter on task rows
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const taskList = document.getElementById('task-list');

  if (!searchInput || !taskList) return;

  searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const taskRows = taskList.querySelectorAll('.task-row');

    if (!taskRows) return;

    taskRows.forEach(row => {
      const taskName = row.querySelector('.task-name');
      if (taskName) {
        const taskText = taskName.textContent.toLowerCase();

        if (searchTerm === '' || taskText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      }
    });
  });
}

// Hides the notification badge when the notification button is clicked
function initNotifications() {
  const notifButton = document.getElementById('btn-notif');
  const notifBadge = document.querySelector('.notif-badge');

  if (notifButton) {
    notifButton.addEventListener('click', () => {
      if (notifBadge) {
        notifBadge.style.display = 'none';
      }
    });
  }
}
