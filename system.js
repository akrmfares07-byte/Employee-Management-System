// Storage keys
const STORAGE_KEY = 'employeeManagementSystem';

// Get data from storage
function getStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      members: [],
      leaders: [],
      tasks: [],
      attendance: [], // Attendance records
      leaves: [], // Leave requests
      evaluations: [], // Performance evaluations
      notes: [], // Admin/Leader notes on members
      notifications: [], // System notifications
      teams: [], // Teams (each leader has a team)
      salary: [], // Salary records
      requests: [], // Break and exception requests
      currentUser: null,
      language: 'ar',
      darkMode: false
    };
  } catch (e) {
    return {
      members: [],
      leaders: [],
      tasks: [],
      attendance: [],
      leaves: [],
      evaluations: [],
      notes: [],
      notifications: [],
      teams: [],
      salary: [],
      requests: [],
      currentUser: null,
      language: 'ar',
      darkMode: false
    };
  }
}

// Save data to storage
function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Initialize
let appData = getStorage();
let currentRole = 'member';
let isRegisterMode = false;
let editingUserId = null;
let currentLang = appData.language || 'ar';
let isDarkMode = appData.darkMode || false;

// DOM Elements
const authScreen = document.getElementById('authScreen');
const memberDashboard = document.getElementById('memberDashboard');
const leaderDashboard = document.getElementById('leaderDashboard');
const adminDashboard = document.getElementById('adminDashboard');

// Dark Mode Toggle
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  appData.darkMode = isDarkMode;
  saveStorage(appData);
  applyDarkMode();
}

function applyDarkMode() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', function() {
  applyDarkMode();
});

// Language Switcher
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentLang = this.dataset.lang;
    appData.language = currentLang;
    saveStorage(appData);
    updateLanguage();
  });
});

// Update Language
function updateLanguage() {
  // Update direction
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  
  // Update all elements with translations
  document.querySelectorAll('[data-ar]').forEach(el => {
    const text = currentLang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    if (el.tagName === 'INPUT' && el.type === 'text') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.textContent = text;
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-placeholder-ar]').forEach(el => {
    el.placeholder = currentLang === 'ar' ? el.getAttribute('data-placeholder-ar') : el.getAttribute('data-placeholder-en');
  });
}

// Initialize language on load
document.addEventListener('DOMContentLoaded', function() {
  // Set active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updateLanguage();
});

// Role Selection
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentRole = this.dataset.role;
    
    const commonFields = document.getElementById('commonFields');
    const registerFields = document.getElementById('registerFields');
    const toggleRegister = document.getElementById('toggleRegister');
    const memberRegFields = document.getElementById('memberRegFields');
    const leaderRegFields = document.getElementById('leaderRegFields');
    
    // Reset
    commonFields.classList.remove('hidden');
    registerFields.classList.add('hidden');
    memberRegFields.classList.add('hidden');
    leaderRegFields.classList.add('hidden');
    toggleRegister.classList.add('hidden');
    isRegisterMode = false;
    
    if (currentRole === 'admin') {
      commonFields.classList.remove('hidden');
      toggleRegister.classList.add('hidden');
    } else if (currentRole === 'leader') {
      commonFields.classList.remove('hidden');
      toggleRegister.classList.remove('hidden'); // Show register button
      toggleRegister.textContent = 'تسجيل قائد جديد';
    } else if (currentRole === 'member') {
      commonFields.classList.remove('hidden');
      toggleRegister.classList.remove('hidden'); // Show register button
      toggleRegister.textContent = 'تسجيل موظف جديد';
    }
  });
});

// Initialize on page load - show register button for member
window.addEventListener('DOMContentLoaded', function() {
  const toggleRegister = document.getElementById('toggleRegister');
  if (currentRole === 'member') {
    toggleRegister.classList.remove('hidden');
  }
});

// Toggle Register Mode
document.getElementById('toggleRegister').addEventListener('click', function() {
  isRegisterMode = !isRegisterMode;
  const registerFields = document.getElementById('registerFields');
  const memberRegFields = document.getElementById('memberRegFields');
  const leaderRegFields = document.getElementById('leaderRegFields');
  
  if (isRegisterMode) {
    registerFields.classList.remove('hidden');
    
    // Show appropriate fields based on role
    if (currentRole === 'member') {
      memberRegFields.classList.remove('hidden');
      leaderRegFields.classList.add('hidden');
      this.textContent = 'العودة لتسجيل الدخول';
    } else if (currentRole === 'leader') {
      memberRegFields.classList.add('hidden');
      leaderRegFields.classList.remove('hidden');
      this.textContent = 'العودة لتسجيل الدخول';
    }
  } else {
    registerFields.classList.add('hidden');
    memberRegFields.classList.add('hidden');
    leaderRegFields.classList.add('hidden');
    
    if (currentRole === 'leader') {
      this.textContent = 'تسجيل قائد جديد';
    } else {
      this.textContent = 'تسجيل موظف جديد';
    }
  }
});

// Auth Form Submit
document.getElementById('authForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (currentRole === 'admin') {
    handleAdminLogin();
  } else if (currentRole === 'member') {
    if (isRegisterMode) {
      handleMemberRegister();
    } else {
      handleMemberLogin();
    }
  } else if (currentRole === 'leader') {
    if (isRegisterMode) {
      handleLeaderRegister();
    } else {
      handleLeaderLogin();
    }
  }
});

// Admin Login - Must be "فارس أكرم" or "fares akram" with password "2388"
function handleAdminLogin() {
  const name = document.getElementById('userName').value.trim().toLowerCase();
  const password = document.getElementById('userPassword').value;
  
  // Check if name is either "فارس أكرم" or "fares akram"
  const validNames = ['فارس أكرم', 'fares akram'];
  const isValidName = validNames.includes(name);
  
  if (isValidName && password === '2388') {
    appData.currentUser = { role: 'admin', name: 'فارس أكرم' };
    saveStorage(appData);
    showDashboard('admin');
  } else {
    if (!isValidName) {
      alert('اسم المدير يجب أن يكون "فارس أكرم" أو "fares akram"');
    } else {
      alert('كلمة المرور غير صحيحة! يجب أن تكون 2388');
    }
  }
}

// Member Register
function handleMemberRegister() {
  const name = document.getElementById('userName').value;
  const password = document.getElementById('userPassword').value;
  const whatsapp = document.getElementById('regWhatsapp').value;
  const email = document.getElementById('regEmail').value;
  const dayOff = document.getElementById('regDayOff').value;
  const checkIn = document.getElementById('regCheckIn').value;
  const checkOut = document.getElementById('regCheckOut').value;
  
  console.log('Registering member:', { name, password, whatsapp, email, dayOff, checkIn, checkOut });
  
  if (!name || !password || !whatsapp || !email || !dayOff || !checkIn || !checkOut) {
    alert('يرجى ملء جميع الحقول المطلوبة!');
    return;
  }
  
  // Reload appData first to get latest data
  appData = getStorage();
  
  // Check if member already exists
  const existingMember = appData.members.find(m => m.name.toLowerCase() === name.toLowerCase());
  if (existingMember) {
    alert('هذا الموظف مسجل بالفعل!');
    return;
  }
  
  const newMember = {
    id: Date.now(),
    name,
    password,
    whatsapp,
    email,
    dayOff,
    checkIn,
    checkOut,
    status: 'absent',
    requests: [] // For storing break and exception requests
  };
  
  console.log('New member object:', newMember);
  
  appData.members.push(newMember);
  console.log('Members after push:', appData.members.length);
  
  // Save immediately
  saveStorage(appData);
  
  // Verify save
  const verifyData = getStorage();
  console.log('Verified members count after save:', verifyData.members.length);
  
  appData.currentUser = { role: 'member', id: newMember.id, name: newMember.name };
  saveStorage(appData);
  
  console.log('Storage saved successfully');
  
  alert('✅ تم التسجيل بنجاح!');
  showDashboard('member');
}

// Leader Register
function handleLeaderRegister() {
  const name = document.getElementById('userName').value;
  const password = document.getElementById('userPassword').value;
  const whatsapp = document.getElementById('regWhatsapp').value;
  const email = document.getElementById('regEmail').value;
  const shift = document.getElementById('regShift').value;
  
  if (!name || !password || !whatsapp || !email || !shift) {
    alert('يرجى ملء جميع الحقول المطلوبة!');
    return;
  }
  
  // Reload appData first
  appData = getStorage();
  
  // Check if leader already exists
  const existingLeader = appData.leaders.find(l => l.name.toLowerCase() === name.toLowerCase());
  if (existingLeader) {
    alert('هذا القائد مسجل بالفعل!');
    return;
  }
  
  const newLeader = {
    id: Date.now(),
    name,
    password,
    whatsapp,
    email,
    shift
  };
  
  appData.leaders.push(newLeader);
  saveStorage(appData);
  
  appData.currentUser = { role: 'leader', id: newLeader.id, name: newLeader.name, shift: newLeader.shift };
  saveStorage(appData);
  
  alert('✅ تم التسجيل بنجاح!');
  showDashboard('leader');
}

// Member Login
function handleMemberLogin() {
  const name = document.getElementById('userName').value;
  const password = document.getElementById('userPassword').value;
  
  const member = appData.members.find(m => m.name === name && m.password === password);
  
  if (member) {
    appData.currentUser = { role: 'member', id: member.id, name: member.name };
    saveStorage(appData);
    showDashboard('member');
  } else {
    alert('الاسم أو كلمة المرور غير صحيحة!');
  }
}

// Leader Login
function handleLeaderLogin() {
  const name = document.getElementById('userName').value;
  const password = document.getElementById('userPassword').value;
  
  const leader = appData.leaders.find(l => l.name === name && l.password === password);
  
  if (leader) {
    appData.currentUser = { 
      role: 'leader', 
      id: leader.id, 
      name: leader.name,
      shift: leader.shift
    };
    saveStorage(appData);
    showDashboard('leader');
  } else {
    alert('الاسم أو كلمة المرور غير صحيحة!');
  }
}

// Show Dashboard
function showDashboard(role) {
  console.log('Showing dashboard for role:', role);
  
  // IMPORTANT: Reload appData to get fresh data
  appData = getStorage();
  console.log('Reloaded appData, members count:', appData.members.length);
  
  authScreen.classList.add('hidden');
  memberDashboard.classList.add('hidden');
  leaderDashboard.classList.add('hidden');
  adminDashboard.classList.add('hidden');
  
  if (role === 'member') {
    memberDashboard.classList.remove('hidden');
    loadMemberDashboard();
  } else if (role === 'leader') {
    leaderDashboard.classList.remove('hidden');
    loadLeaderDashboard();
    // Setup filter buttons after dashboard is visible
    setTimeout(() => {
      setupFilterButtons();
    }, 200);
  } else if (role === 'admin') {
    adminDashboard.classList.remove('hidden');
    loadAdminDashboard();
    // Setup admin filter buttons
    setTimeout(() => {
      setupAdminFilterButtons();
    }, 200);
  }
}

// Logout
function logout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    appData.currentUser = null;
    saveStorage(appData);
    location.reload();
  }
}

// Load Member Dashboard
function loadMemberDashboard() {
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  if (!member) return;
  
  document.getElementById('memberNameNav').textContent = member.name;
  document.getElementById('memberNameHero').textContent = member.name;
  document.getElementById('memberAvatar').textContent = member.name.charAt(0);
  document.getElementById('memberCheckIn').textContent = member.checkIn;
  document.getElementById('memberCheckOut').textContent = member.checkOut;
  document.getElementById('memberDayOff').textContent = member.dayOff;
  
  // Load tasks for this member
  const memberTasks = appData.tasks.filter(t => t.memberId === member.id);
  const tasksContainer = document.getElementById('memberTasks');
  
  if (memberTasks.length === 0) {
    tasksContainer.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>لا توجد مهام مسندة حالياً</p></div>';
  } else {
    tasksContainer.innerHTML = memberTasks.map(task => `
      <div class="task-item">
        <h4>${task.details}</h4>
        <p><i class="fas fa-user"></i> مُسند بواسطة: ${task.assignedBy}</p>
        <span class="task-type">${task.type}</span>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
          <i class="fas fa-calendar"></i> ${new Date(task.date).toLocaleDateString('ar-EG')}
        </p>
      </div>
    `).join('');
  }
}

// Load Leader Dashboard
function loadLeaderDashboard() {
  console.log('=== Loading leader dashboard ===');
  
  // CRITICAL: Reload data from storage
  appData = getStorage();
  console.log('Reloaded appData from storage');
  console.log('Members count:', appData.members.length);
  console.log('Members:', JSON.stringify(appData.members));
  
  const leader = appData.leaders.find(l => l.id === appData.currentUser.id);
  if (!leader) {
    console.error('Leader not found!');
    alert('خطأ: لم يتم العثور على بيانات القائد!');
    return;
  }
  
  console.log('Leader found:', leader);
  
  document.getElementById('leaderNameNav').textContent = leader.name;
  document.getElementById('leaderNameHero').textContent = leader.name;
  document.getElementById('leaderAvatar').textContent = leader.name.charAt(0);
  document.getElementById('leaderShiftBadge').textContent = leader.shift || 'غير محدد';
  
  // Calculate stats
  const now = new Date();
  const currentHour = now.getHours();
  
  let presentCount = 0;
  let absentCount = 0;
  
  console.log('Calculating stats for', appData.members.length, 'members');
  
  appData.members.forEach(member => {
    if (!member.checkIn || !member.checkOut) {
      console.warn('Member missing time data:', member.name);
      absentCount++;
      return;
    }
    
    const [checkInHour] = member.checkIn.split(':').map(Number);
    const [checkOutHour] = member.checkOut.split(':').map(Number);
    
    if (currentHour >= checkInHour && currentHour < checkOutHour) {
      presentCount++;
    } else {
      absentCount++;
    }
  });
  
  document.getElementById('totalMembers').textContent = appData.members.length;
  document.getElementById('presentMembers').textContent = presentCount;
  document.getElementById('absentMembers').textContent = absentCount;
  
  console.log('Stats updated:', { total: appData.members.length, present: presentCount, absent: absentCount });
  
  // Load members table - FORCE RELOAD with slight delay
  console.log('About to load members table...');
  setTimeout(() => {
    loadMembersTable('all');
  }, 100);
  
  // Load task member select
  const taskMemberSelect = document.getElementById('taskMember');
  if (taskMemberSelect) {
    taskMemberSelect.innerHTML = '<option value="">اختر الموظف</option>' + 
      appData.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    console.log('Task member select updated with', appData.members.length, 'members');
  }
  
  // Load all tasks
  loadAllTasks();
  
  console.log('=== Leader dashboard loaded ===');
}

// Setup filter buttons - call this separately
function setupFilterButtons() {
  console.log('Setting up filter buttons for leader...');
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  console.log('Found filter buttons:', filterBtns.length);
  
  filterBtns.forEach((btn, index) => {
    console.log(`Button ${index}:`, btn.dataset.filter);
    
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.dataset.filter;
      console.log('Filter button clicked:', filter);
      
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Reload table
      loadMembersTable(filter);
    });
  });
  
  console.log('Filter buttons setup complete');
}

// Load Members Table
function loadMembersTable(filter) {
  console.log('=== Loading members table ===');
  console.log('Filter:', filter);
  console.log('Total members in system:', appData.members.length);
  
  // Reload data first
  appData = getStorage();
  console.log('After reload, members:', appData.members.length);
  
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) {
    console.error('Table body not found!');
    return;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  let filteredMembers = [...appData.members]; // Create copy
  
  console.log('Before filter, members:', filteredMembers.length);
  
  if (filter === 'present') {
    filteredMembers = appData.members.filter(member => {
      if (!member.checkIn || !member.checkOut) return false;
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      return currentHour >= checkInHour && currentHour < checkOutHour;
    });
  } else if (filter === 'absent') {
    filteredMembers = appData.members.filter(member => {
      if (!member.checkIn || !member.checkOut) return true;
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      return currentHour < checkInHour || currentHour >= checkOutHour;
    });
  }
  // If filter === 'all', keep all members
  
  console.log('After filter, members:', filteredMembers.length);
  
  if (filteredMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">لا توجد بيانات موظفين</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredMembers.map(member => {
    let isPresent = false;
    if (member.checkIn && member.checkOut) {
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      isPresent = currentHour >= checkInHour && currentHour < checkOutHour;
    }
    
    return `
      <tr>
        <td><strong>${member.name}</strong></td>
        <td>${member.whatsapp || '-'}</td>
        <td><span class="status-badge ${isPresent ? 'status-present' : 'status-absent'}">${isPresent ? 'حاضر' : 'منصرف'}</span></td>
        <td>${member.checkIn || '-'}</td>
        <td>${member.checkOut || '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="viewMemberDetails(${member.id})">
              <i class="fas fa-eye"></i> عرض
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  console.log('=== Members table loaded successfully ===');
}

// View Member Details
function viewMemberDetails(memberId) {
  appData = getStorage();
  const member = appData.members.find(m => m.id === memberId);
  if (!member) return;
  
  // Store current member ID for other functions to use
  window.currentMemberId = memberId;
  
  // Build attendance summary
  let attendanceSummary = 'لا يوجد سجل حضور';
  if (member.attendance && member.attendance.length > 0) {
    const total = member.attendance.length;
    const onTime = member.attendance.filter(a => a.status === 'onTime').length;
    attendanceSummary = `${total} يوم حضور، ${onTime} في الموعد`;
  }
  
  // Build ratings summary
  let ratingsSummary = 'لا يوجد تقييم';
  if (member.averageRating) {
    ratingsSummary = `${member.averageRating} من 5 (${member.ratings ? member.ratings.length : 0} تقييم)`;
  }
  
  // Build warnings summary
  let warningsSummary = 'لا توجد إنذارات';
  if (member.warningsCount && member.warningsCount > 0) {
    warningsSummary = `${member.warningsCount} إنذار`;
  }
  
  // Build salary info
  let salaryInfo = 'غير محدد';
  if (member.baseSalary) {
    salaryInfo = `${member.baseSalary} جنيه`;
  }
  
  // Create modal content
  const modalContent = `
    <div style="text-align: right; line-height: 1.8;">
      <h3 style="color: var(--accent); margin-bottom: 20px;">📋 ${member.name}</h3>
      
      <div style="background: var(--bg-secondary); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
        <h4 style="margin-bottom: 15px;">معلومات أساسية</h4>
        <p><strong>📱 الواتساب:</strong> ${member.whatsapp}</p>
        <p><strong>📧 البريد:</strong> ${member.email}</p>
        <p><strong>📅 يوم الإجازة:</strong> ${member.dayOff}</p>
        <p><strong>🕐 وقت الحضور:</strong> ${member.checkIn}</p>
        <p><strong>🕔 وقت الانصراف:</strong> ${member.checkOut}</p>
        <p><strong>💰 الراتب الأساسي:</strong> ${salaryInfo}</p>
      </div>
      
      <div style="background: var(--bg-secondary); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
        <h4 style="margin-bottom: 15px;">الإحصائيات</h4>
        <p><strong>📊 الحضور:</strong> ${attendanceSummary}</p>
        <p><strong>⭐ التقييم:</strong> ${ratingsSummary}</p>
        <p><strong>⚠️ الإنذارات:</strong> ${warningsSummary}</p>
      </div>
      
      ${appData.currentUser.role === 'admin' || appData.currentUser.role === 'leader' ? `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px;">
        <button class="btn btn-primary" onclick="closeViewModal(); openRatingModal(${memberId});" style="width: 100%;">
          <i class="fas fa-star"></i> تقييم
        </button>
        <button class="btn btn-primary" onclick="closeViewModal(); openNoteModal(${memberId}, 'note');" style="width: 100%;">
          <i class="fas fa-sticky-note"></i> ملاحظة
        </button>
        <button class="btn btn-warning" onclick="closeViewModal(); openNoteModal(${memberId}, 'warning');" style="width: 100%;">
          <i class="fas fa-exclamation-triangle"></i> إنذار
        </button>
        <button class="btn btn-primary" onclick="closeViewModal(); generateMonthlyReport(${memberId});" style="width: 100%;">
          <i class="fas fa-file-alt"></i> تقرير
        </button>
        ${member.baseSalary ? `
        <button class="btn btn-primary" onclick="closeViewModal(); calculateSalary(${memberId});" style="width: 100%;">
          <i class="fas fa-money-bill"></i> الراتب
        </button>
        ` : ''}
      </div>
      ` : ''}
    </div>
  `;
  
  // Show in a custom modal
  showCustomModal('تفاصيل الموظف', modalContent);
}

// Helper function to show custom modal
function showCustomModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'customViewModal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeViewModal()"></div>
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="closeViewModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeViewModal()">إغلاق</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Helper function to close custom view modal
function closeViewModal() {
  const modal = document.getElementById('customViewModal');
  if (modal) {
    modal.remove();
  }
}

// Task Form Submit
document.getElementById('taskForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const memberId = parseInt(document.getElementById('taskMember').value);
  const type = document.getElementById('taskType').value;
  const details = document.getElementById('taskDetails').value;
  
  const member = appData.members.find(m => m.id === memberId);
  const leader = appData.leaders.find(l => l.id === appData.currentUser.id);
  
  if (!member || !leader) {
    alert('حدث خطأ! يرجى المحاولة مرة أخرى.');
    return;
  }
  
  const newTask = {
    id: Date.now(),
    memberId,
    memberName: member.name,
    type,
    details,
    assignedBy: leader.name,
    date: Date.now()
  };
  
  appData.tasks.push(newTask);
  saveStorage(appData);
  
  alert('✅ تم إسناد المهمة بنجاح!');
  this.reset();
  loadAllTasks();
});

// Load All Tasks
function loadAllTasks() {
  const container = document.getElementById('allTasks');
  
  if (appData.tasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>لا توجد مهام مسندة</p></div>';
    return;
  }
  
  // Sort by date (newest first)
  const sortedTasks = [...appData.tasks].sort((a, b) => b.date - a.date);
  
  container.innerHTML = sortedTasks.map(task => `
    <div class="task-item">
      <h4>${task.details}</h4>
      <p><i class="fas fa-user"></i> الموظف: ${task.memberName}</p>
      <p><i class="fas fa-user-tie"></i> مُسند بواسطة: ${task.assignedBy}</p>
      <span class="task-type">${task.type}</span>
      <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
        <i class="fas fa-calendar"></i> ${new Date(task.date).toLocaleDateString('ar-EG')}
      </p>
      <button class="btn-action btn-delete" onclick="deleteTask(${task.id})" style="margin-top: 10px; width: 100%;">
        <i class="fas fa-trash"></i> حذف المهمة
      </button>
    </div>
  `).join('');
}

// Delete Task
function deleteTask(taskId) {
  if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
    appData.tasks = appData.tasks.filter(t => t.id !== taskId);
    saveStorage(appData);
    loadAllTasks();
    alert('تم الحذف بنجاح!');
  }
}

// Load Admin Dashboard
function loadAdminDashboard() {
  console.log('=== Loading admin dashboard ===');
  
  // Reload data
  appData = getStorage();
  
  // Calculate stats
  const now = new Date();
  const currentHour = now.getHours();
  
  let presentCount = 0;
  let absentCount = 0;
  
  appData.members.forEach(m => {
    if (!m.checkIn || !m.checkOut) {
      absentCount++;
      return;
    }
    const [checkInHour] = m.checkIn.split(':').map(Number);
    const [checkOutHour] = m.checkOut.split(':').map(Number);
    
    if (currentHour >= checkInHour && currentHour < checkOutHour) {
      presentCount++;
    } else {
      absentCount++;
    }
  });
  
  document.getElementById('adminTotalMembers').textContent = appData.members.length;
  document.getElementById('adminTotalLeaders').textContent = appData.leaders.length;
  document.getElementById('adminPresentToday').textContent = presentCount;
  document.getElementById('adminAbsentToday').textContent = absentCount;
  
  // Calculate enhanced statistics
  
  // 1. Attendance Rate
  const totalAttendance = appData.members.reduce((sum, m) => {
    return sum + (m.attendance ? m.attendance.length : 0);
  }, 0);
  
  const onTimeAttendance = appData.members.reduce((sum, m) => {
    if (!m.attendance) return sum;
    return sum + m.attendance.filter(a => a.status === 'onTime').length;
  }, 0);
  
  const attendanceRate = totalAttendance > 0 ? 
    ((onTimeAttendance / totalAttendance) * 100).toFixed(1) : 0;
  
  const attendanceRateEl = document.getElementById('attendanceRate');
  if (attendanceRateEl) {
    attendanceRateEl.textContent = attendanceRate + '%';
  }
  
  // 2. Average Rating
  const ratedMembers = appData.members.filter(m => m.averageRating);
  const avgRating = ratedMembers.length > 0 ?
    (ratedMembers.reduce((sum, m) => sum + parseFloat(m.averageRating), 0) / ratedMembers.length).toFixed(2) : 0;
  
  const avgRatingEl = document.getElementById('averageRating');
  if (avgRatingEl) {
    avgRatingEl.textContent = avgRating;
  }
  
  // 3. Completed Tasks
  const completedTasks = appData.tasks.filter(t => t.status === 'completed').length;
  const completedTasksEl = document.getElementById('completedTasks');
  if (completedTasksEl) {
    completedTasksEl.textContent = `${completedTasks} / ${appData.tasks.length}`;
  }
  
  // 4. Total Warnings
  const totalWarnings = appData.members.reduce((sum, m) => {
    return sum + (m.warningsCount || 0);
  }, 0);
  
  const totalWarningsEl = document.getElementById('totalWarnings');
  if (totalWarningsEl) {
    totalWarningsEl.textContent = totalWarnings;
  }
  
  // Load members table with filter
  loadAdminMembersTable('all');
  
  // Load task member select for admin
  const adminTaskMemberSelect = document.getElementById('adminTaskMember');
  if (adminTaskMemberSelect) {
    adminTaskMemberSelect.innerHTML = '<option value="">اختر الموظف</option>' + 
      appData.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }
  
  // Load admin tasks
  loadAdminAllTasks();
  
  // Load admin users table
  loadAdminTable();
  
  // Load admin requests
  loadAdminRequests();
  
  // Load activity log
  loadActivityLog();
  
  // Load comprehensive tasks dashboard
  loadComprehensiveTasksDashboard();
  
  // Update sidebar badge
  updateSidebarBadge();
  
  console.log('=== Admin dashboard loaded ===');
}

// Load Admin Members Table with Filter
function loadAdminMembersTable(filter) {
  console.log('=== Loading admin members table ===');
  console.log('Filter:', filter);
  
  // Reload data first
  appData = getStorage();
  console.log('Total members in system:', appData.members.length);
  
  const tbody = document.getElementById('adminMembersTableBody');
  if (!tbody) {
    console.error('Admin table body not found!');
    return;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  let filteredMembers = [...appData.members]; // Create copy
  
  console.log('Before filter, members:', filteredMembers.length);
  
  if (filter === 'present') {
    filteredMembers = appData.members.filter(member => {
      if (!member.checkIn || !member.checkOut) return false;
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      return currentHour >= checkInHour && currentHour < checkOutHour;
    });
  } else if (filter === 'absent') {
    filteredMembers = appData.members.filter(member => {
      if (!member.checkIn || !member.checkOut) return true;
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      return currentHour < checkInHour || currentHour >= checkOutHour;
    });
  }
  // If filter === 'all', keep all members
  
  console.log('After filter, members:', filteredMembers.length);
  
  if (filteredMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">لا توجد بيانات موظفين</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredMembers.map(member => {
    let isPresent = false;
    if (member.checkIn && member.checkOut) {
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      isPresent = currentHour >= checkInHour && currentHour < checkOutHour;
    }
    
    return `
      <tr>
        <td><strong>${member.name}</strong></td>
        <td>${member.whatsapp || '-'}</td>
        <td><span class="status-badge ${isPresent ? 'status-present' : 'status-absent'}">${isPresent ? 'حاضر' : 'منصرف'}</span></td>
        <td>${member.checkIn || '-'}</td>
        <td>${member.checkOut || '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="viewMemberDetails(${member.id})">
              <i class="fas fa-eye"></i> عرض
            </button>
            <button class="btn-action btn-edit" onclick="editUser('member', ${member.id})">
              <i class="fas fa-edit"></i> تعديل
            </button>
            <button class="btn-action btn-delete" onclick="deleteUser('member', ${member.id})">
              <i class="fas fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  console.log('=== Admin members table loaded successfully ===');
}

// Setup Admin Filter Buttons
function setupAdminFilterButtons() {
  console.log('Setting up admin filter buttons...');
  
  const filterBtns = document.querySelectorAll('.admin-filter-btn');
  console.log('Found admin filter buttons:', filterBtns.length);
  
  filterBtns.forEach((btn, index) => {
    console.log(`Admin button ${index}:`, btn.dataset.filter);
    
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.dataset.filter;
      console.log('Admin filter button clicked:', filter);
      
      // Update active state
      document.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Reload table
      loadAdminMembersTable(filter);
    });
  });
  
  console.log('Admin filter buttons setup complete');
}

// Admin Task Form Submit
document.getElementById('adminTaskForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const memberId = parseInt(document.getElementById('adminTaskMember').value);
  const type = document.getElementById('adminTaskType').value;
  const details = document.getElementById('adminTaskDetails').value;
  
  const member = appData.members.find(m => m.id === memberId);
  
  if (!member) {
    alert('حدث خطأ! يرجى المحاولة مرة أخرى.');
    return;
  }
  
  const newTask = {
    id: Date.now(),
    memberId,
    memberName: member.name,
    type,
    details,
    assignedBy: 'المدير - فارس أكرم',
    date: Date.now()
  };
  
  appData.tasks.push(newTask);
  saveStorage(appData);
  
  alert('✅ تم إسناد المهمة بنجاح!');
  this.reset();
  loadAdminAllTasks();
});

// Load Admin All Tasks
function loadAdminAllTasks() {
  const container = document.getElementById('adminAllTasks');
  
  if (!container) return;
  
  if (appData.tasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>لا توجد مهام مسندة</p></div>';
    return;
  }
  
  const sortedTasks = [...appData.tasks].sort((a, b) => b.date - a.date);
  
  container.innerHTML = sortedTasks.map(task => `
    <div class="task-item">
      <h4>${task.details}</h4>
      <p><i class="fas fa-user"></i> الموظف: ${task.memberName}</p>
      <p><i class="fas fa-user-tie"></i> مُسند بواسطة: ${task.assignedBy}</p>
      <span class="task-type">${task.type}</span>
      <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
        <i class="fas fa-calendar"></i> ${new Date(task.date).toLocaleDateString('ar-EG')}
      </p>
      <button class="btn-action btn-delete" onclick="deleteTaskAsAdmin(${task.id})" style="margin-top: 10px; width: 100%;">
        <i class="fas fa-trash"></i> حذف المهمة
      </button>
    </div>
  `).join('');
}

// Delete Task As Admin
function deleteTaskAsAdmin(taskId) {
  if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
    appData.tasks = appData.tasks.filter(t => t.id !== taskId);
    saveStorage(appData);
    loadAdminAllTasks();
    alert('تم الحذف بنجاح!');
  }
}

// Export to Excel Function
function exportToExcel() {
  console.log('Exporting to Excel...');
  
  if (appData.members.length === 0) {
    alert('لا يوجد موظفين لتصديرهم!');
    return;
  }
  
  // Create CSV content
  let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support
  
  // Headers
  csvContent += 'الاسم,رقم الواتساب,البريد الإلكتروني,يوم الإجازة,وقت الحضور,وقت الانصراف,الحالة\n';
  
  // Data rows
  const now = new Date();
  const currentHour = now.getHours();
  
  appData.members.forEach(member => {
    const [checkInHour] = member.checkIn ? member.checkIn.split(':').map(Number) : [0];
    const [checkOutHour] = member.checkOut ? member.checkOut.split(':').map(Number) : [0];
    const isPresent = currentHour >= checkInHour && currentHour < checkOutHour;
    const status = isPresent ? 'حاضر' : 'منصرف';
    
    csvContent += `${member.name},${member.whatsapp},${member.email},${member.dayOff},${member.checkIn},${member.checkOut},${status}\n`;
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
  link.setAttribute('href', url);
  link.setAttribute('download', `بيانات_الموظفين_${date}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('Excel export completed');
  alert('✅ تم تصدير البيانات بنجاح!');
}

// Load Admin Table
function loadAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const allUsers = [
    ...appData.members.map(m => ({...m, role: 'member', roleText: 'موظف'})),
    ...appData.leaders.map(l => ({...l, role: 'leader', roleText: 'قائد فريق', shift: l.shift || 'غير محدد'}))
  ];
  
  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">لا يوجد مستخدمون</td></tr>';
    return;
  }
  
  tbody.innerHTML = allUsers.map(user => `
    <tr>
      <td><strong>${user.name}</strong></td>
      <td>
        <span class="status-badge ${user.role === 'leader' ? 'status-leader' : 'status-present'}">
          ${user.roleText}
        </span>
        ${user.shift ? `<span class="status-badge" style="margin-right: 8px;">${user.shift}</span>` : ''}
      </td>
      <td>${user.whatsapp || '-'}</td>
      <td>${user.email || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="editUser('${user.role}', ${user.id})">
            <i class="fas fa-edit"></i> تعديل
          </button>
          <button class="btn-action btn-delete" onclick="deleteUser('${user.role}', ${user.id})">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Open Add User Modal
function openAddUserModal() {
  editingUserId = null;
  document.getElementById('modalTitle').textContent = 'إضافة مستخدم جديد';
  document.getElementById('userModalForm').reset();
  document.getElementById('userModal').classList.add('active');
  toggleModalFields();
}

// Edit User
function editUser(role, userId) {
  editingUserId = { role, id: userId };
  const user = role === 'member' 
    ? appData.members.find(m => m.id === userId)
    : appData.leaders.find(l => l.id === userId);
  
  if (!user) return;
  
  document.getElementById('modalTitle').textContent = 'تعديل بيانات المستخدم';
  document.getElementById('modalRole').value = role;
  document.getElementById('modalName').value = user.name;
  document.getElementById('modalPassword').value = user.password;
  document.getElementById('modalWhatsapp').value = user.whatsapp || '';
  document.getElementById('modalEmail').value = user.email || '';
  
  if (role === 'member') {
    document.getElementById('modalDayOff').value = user.dayOff || '';
    document.getElementById('modalCheckIn').value = user.checkIn || '';
    document.getElementById('modalCheckOut').value = user.checkOut || '';
  } else {
    document.getElementById('modalShift').value = user.shift || '';
  }
  
  document.getElementById('userModal').classList.add('active');
  toggleModalFields();
}

// Delete User
function deleteUser(role, userId) {
  if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟\nسيتم حذف جميع بياناته بشكل نهائي!')) return;
  
  if (role === 'member') {
    appData.members = appData.members.filter(m => m.id !== userId);
    // Delete associated tasks
    appData.tasks = appData.tasks.filter(t => t.memberId !== userId);
  } else {
    appData.leaders = appData.leaders.filter(l => l.id !== userId);
  }
  
  saveStorage(appData);
  loadAdminTable();
  alert('✅ تم الحذف بنجاح!');
}

// Close Modal
function closeModal() {
  document.getElementById('userModal').classList.remove('active');
  editingUserId = null;
}

// Toggle Modal Fields based on role
document.getElementById('modalRole').addEventListener('change', toggleModalFields);

function toggleModalFields() {
  const role = document.getElementById('modalRole').value;
  const memberFields = document.getElementById('memberModalFields');
  const leaderFields = document.getElementById('leaderModalFields');
  
  if (role === 'member') {
    memberFields.classList.remove('hidden');
    leaderFields.classList.add('hidden');
  } else {
    memberFields.classList.add('hidden');
    leaderFields.classList.remove('hidden');
  }
}

// User Modal Form Submit
document.getElementById('userModalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const role = document.getElementById('modalRole').value;
  const name = document.getElementById('modalName').value;
  const password = document.getElementById('modalPassword').value;
  const whatsapp = document.getElementById('modalWhatsapp').value;
  const email = document.getElementById('modalEmail').value;
  
  const userData = {
    name,
    password,
    whatsapp,
    email
  };
  
  if (role === 'member') {
    userData.dayOff = document.getElementById('modalDayOff').value;
    userData.checkIn = document.getElementById('modalCheckIn').value;
    userData.checkOut = document.getElementById('modalCheckOut').value;
    userData.baseSalary = document.getElementById('modalBaseSalary').value;
    userData.status = 'absent';
    
    if (!userData.dayOff || !userData.checkIn || !userData.checkOut) {
      alert('يرجى ملء جميع حقول الموظف!');
      return;
    }
  } else {
    userData.shift = document.getElementById('modalShift').value;
    
    if (!userData.shift) {
      alert('يرجى اختيار شيفت القائد!');
      return;
    }
  }
  
  if (editingUserId) {
    // Update existing user
    if (editingUserId.role === 'member') {
      const index = appData.members.findIndex(m => m.id === editingUserId.id);
      if (index !== -1) {
        appData.members[index] = { ...appData.members[index], ...userData };
      }
    } else {
      const index = appData.leaders.findIndex(l => l.id === editingUserId.id);
      if (index !== -1) {
        appData.leaders[index] = { ...appData.leaders[index], ...userData };
      }
    }
    alert('✅ تم التعديل بنجاح!');
  } else {
    // Add new user
    userData.id = Date.now();
    
    if (role === 'member') {
      appData.members.push(userData);
    } else {
      appData.leaders.push(userData);
    }
    alert('✅ تم الإضافة بنجاح!');
  }
  
  saveStorage(appData);
  closeModal();
  loadAdminTable();
});

// Check if user is already logged in
window.addEventListener('load', function() {
  if (appData.currentUser) {
    showDashboard(appData.currentUser.role);
  }
});

// Exception Modal Functions
function openExceptionModal() {
  document.getElementById('exceptionModal').classList.add('active');
}

function closeExceptionModal() {
  document.getElementById('exceptionModal').classList.remove('active');
}

// Break Modal Functions  
function openBreakModal() {
  document.getElementById('breakModal').classList.add('active');
}

function closeBreakModal() {
  document.getElementById('breakModal').classList.remove('active');
}

// Exception Request Submit
document.getElementById('exceptionForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const time = document.getElementById('exceptionTime').value;
  const reason = document.getElementById('exceptionReason').value;
  
  // Reload data
  appData = getStorage();
  
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const request = {
    id: Date.now(),
    type: 'exception',
    memberId: member.id,
    memberName: member.name,
    memberWhatsapp: member.whatsapp,
    time: time,
    reason: reason,
    status: 'pending',
    date: Date.now()
  };
  
  if (!appData.requests) {
    appData.requests = [];
  }
  
  appData.requests.push(request);
  saveStorage(appData);
  
  alert('✅ تم إرسال طلب الاستئذان بنجاح!\nسيتم مراجعته من قبل الإدارة.');
  closeExceptionModal();
  this.reset();
});

// Break Request Submit
document.getElementById('breakForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const duration = document.getElementById('breakDuration').value;
  const notes = document.getElementById('breakNotes').value;
  
  // Reload data
  appData = getStorage();
  
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const request = {
    id: Date.now(),
    type: 'break',
    memberId: member.id,
    memberName: member.name,
    memberWhatsapp: member.whatsapp,
    duration: duration,
    notes: notes,
    status: 'pending',
    date: Date.now()
  };
  
  if (!appData.requests) {
    appData.requests = [];
  }
  
  appData.requests.push(request);
  saveStorage(appData);
  
  alert('✅ تم إرسال طلب البريك بنجاح!\nسيتم مراجعته من قبل الإدارة.');
  closeBreakModal();
  this.reset();
});

// Load Admin Requests
function loadAdminRequests() {
  appData = getStorage();
  
  if (!appData.requests) {
    appData.requests = [];
  }
  
  const container = document.getElementById('adminRequests');
  const countEl = document.getElementById('requestsCount');
  
  if (!container) return;
  
  const pendingRequests = appData.requests.filter(r => r.status === 'pending');
  
  if (countEl) {
    countEl.textContent = `${pendingRequests.length} طلب جديد`;
  }
  
  if (appData.requests.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>لا توجد طلبات</p></div>';
    return;
  }
  
  const sortedRequests = [...appData.requests].sort((a, b) => b.date - a.date);
  
  container.innerHTML = sortedRequests.map(request => {
    const statusClass = request.status === 'pending' ? 'status-absent' : 
                       request.status === 'approved' ? 'status-present' : 'status-absent';
    const statusText = request.status === 'pending' ? 'قيد المراجعة' : 
                      request.status === 'approved' ? 'تمت الموافقة' : 'مرفوض';
    
    let requestDetails = '';
    if (request.type === 'exception') {
      requestDetails = `
        <p><strong>وقت المغادرة:</strong> ${request.time}</p>
        <p><strong>السبب:</strong> ${request.reason}</p>
      `;
    } else {
      requestDetails = `
        <p><strong>المدة:</strong> ${request.duration} دقيقة</p>
        ${request.notes ? `<p><strong>ملاحظات:</strong> ${request.notes}</p>` : ''}
      `;
    }
    
    return `
      <div class="request-card">
        <div class="request-header">
          <h4>${request.memberName}</h4>
          <span class="request-type">${request.type === 'exception' ? 'استئذان' : 'بريك'}</span>
        </div>
        <div class="request-body">
          <p><strong>الواتساب:</strong> ${request.memberWhatsapp}</p>
          ${requestDetails}
          <p><strong>التاريخ:</strong> ${new Date(request.date).toLocaleString('ar-EG')}</p>
          <p><strong>الحالة:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
        </div>
        ${request.status === 'pending' ? `
          <div class="request-actions">
            <button class="btn-action btn-edit" onclick="approveRequest(${request.id})">
              <i class="fas fa-check"></i> قبول
            </button>
            <button class="btn-action btn-delete" onclick="rejectRequest(${request.id})">
              <i class="fas fa-times"></i> رفض
            </button>
            <button class="btn-action btn-view" onclick="sendWhatsAppNotification('${request.memberWhatsapp}', '${request.memberName}', '${request.type}')">
              <i class="fab fa-whatsapp"></i> إرسال واتساب
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Approve Request
function approveRequest(requestId) {
  appData = getStorage();
  
  const request = appData.requests.find(r => r.id === requestId);
  if (!request) return;
  
  request.status = 'approved';
  saveStorage(appData);
  
  alert('✅ تمت الموافقة على الطلب!');
  loadAdminRequests();
}

// Reject Request
function rejectRequest(requestId) {
  if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
  
  appData = getStorage();
  
  const request = appData.requests.find(r => r.id === requestId);
  if (!request) return;
  
  request.status = 'rejected';
  saveStorage(appData);
  
  alert('تم رفض الطلب');
  loadAdminRequests();
}

// Send WhatsApp Notification
function sendWhatsAppNotification(phone, name, type) {
  const requestType = type === 'exception' ? 'استئذان' : 'بريك';
  const message = `مرحباً ${name}،\n\nتم استلام طلب ${requestType} الخاص بك وهو قيد المراجعة.\n\nشكراً لك.`;
  
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
// ==========================================
// ENHANCED EMPLOYEE MANAGEMENT SYSTEM
// All New Features Implementation
// ==========================================

// ==========================================
// 1. ATTENDANCE SYSTEM - تسجيل الحضور والانصراف
// ==========================================

function recordCheckIn() {
  appData = getStorage();
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Initialize attendance array if not exists
  if (!member.attendance) {
    member.attendance = [];
  }
  
  // Check if already checked in today
  const todayRecord = member.attendance.find(a => a.date === currentDate);
  if (todayRecord && todayRecord.actualCheckIn) {
    alert('لقد سجلت حضورك اليوم بالفعل!');
    return;
  }
  
  // Calculate if late
  const [scheduledHour, scheduledMin] = member.checkIn.split(':').map(Number);
  const [actualHour, actualMin] = currentTime.split(':').map(Number);
  const scheduledMinutes = scheduledHour * 60 + scheduledMin;
  const actualMinutes = actualHour * 60 + actualMin;
  const lateMinutes = Math.max(0, actualMinutes - scheduledMinutes);
  
  const attendanceRecord = {
    date: currentDate,
    actualCheckIn: currentTime,
    scheduledCheckIn: member.checkIn,
    lateMinutes: lateMinutes,
    status: lateMinutes > 0 ? 'late' : 'onTime'
  };
  
  if (todayRecord) {
    Object.assign(todayRecord, attendanceRecord);
  } else {
    member.attendance.push(attendanceRecord);
  }
  
  saveStorage(appData);
  
  if (lateMinutes > 0) {
    alert(`✅ تم تسجيل الحضور!\n⚠️ تأخرت ${lateMinutes} دقيقة`);
  } else {
    alert('✅ تم تسجيل الحضور في الموعد!');
  }
  
  loadMemberDashboard();
}

function recordCheckOut() {
  appData = getStorage();
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDate = now.toISOString().split('T')[0];
  
  if (!member.attendance) {
    member.attendance = [];
  }
  
  const todayRecord = member.attendance.find(a => a.date === currentDate);
  
  if (!todayRecord || !todayRecord.actualCheckIn) {
    alert('يجب تسجيل الحضور أولاً!');
    return;
  }
  
  if (todayRecord.actualCheckOut) {
    alert('لقد سجلت انصرافك اليوم بالفعل!');
    return;
  }
  
  // Calculate if early leave
  const [scheduledHour, scheduledMin] = member.checkOut.split(':').map(Number);
  const [actualHour, actualMin] = currentTime.split(':').map(Number);
  const scheduledMinutes = scheduledHour * 60 + scheduledMin;
  const actualMinutes = actualHour * 60 + actualMin;
  const earlyMinutes = Math.max(0, scheduledMinutes - actualMinutes);
  
  todayRecord.actualCheckOut = currentTime;
  todayRecord.scheduledCheckOut = member.checkOut;
  todayRecord.earlyMinutes = earlyMinutes;
  
  if (earlyMinutes > 0) {
    todayRecord.status = 'earlyLeave';
  }
  
  // Calculate total work hours
  const checkInMinutes = parseInt(todayRecord.actualCheckIn.split(':')[0]) * 60 + 
                        parseInt(todayRecord.actualCheckIn.split(':')[1]);
  const checkOutMinutes = actualHour * 60 + actualMin;
  todayRecord.workHours = ((checkOutMinutes - checkInMinutes) / 60).toFixed(2);
  
  saveStorage(appData);
  
  if (earlyMinutes > 0) {
    alert(`✅ تم تسجيل الانصراف!\n⚠️ انصرفت مبكراً ${earlyMinutes} دقيقة`);
  } else {
    alert(`✅ تم تسجيل الانصراف!\n⏱️ عملت ${todayRecord.workHours} ساعة اليوم`);
  }
  
  loadMemberDashboard();
}

// ==========================================
// 2. TASK STATUS SYSTEM - حالة المهام
// ==========================================

function updateTaskStatus(taskId, status) {
  appData = getStorage();
  const task = appData.tasks.find(t => t.id === taskId);
  
  if (!task) {
    alert('حدث خطأ!');
    return;
  }
  
  task.status = status;
  task.statusUpdatedAt = Date.now();
  
  if (status === 'completed') {
    task.completedAt = Date.now();
  }
  
  saveStorage(appData);
  
  const statusText = {
    'pending': 'قيد الانتظار',
    'inProgress': 'قيد التنفيذ',
    'completed': 'مكتملة'
  };
  
  alert(`✅ تم تحديث حالة المهمة إلى: ${statusText[status]}`);
  
  // Reload based on current user role
  if (appData.currentUser.role === 'member') {
    loadMemberTasks();
  } else if (appData.currentUser.role === 'leader') {
    loadAllTasks();
  } else {
    loadAdminAllTasks();
  }
}

// ==========================================
// 3. VACATION SYSTEM - نظام الإجازات
// ==========================================

function requestVacation() {
  const startDate = document.getElementById('vacationStartDate').value;
  const endDate = document.getElementById('vacationEndDate').value;
  const reason = document.getElementById('vacationReason').value;
  
  if (!startDate || !endDate || !reason) {
    alert('يرجى ملء جميع الحقول!');
    return;
  }
  
  appData = getStorage();
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  // Calculate vacation days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (days <= 0) {
    alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية!');
    return;
  }
  
  const vacationRequest = {
    id: Date.now(),
    type: 'vacation',
    memberId: member.id,
    memberName: member.name,
    memberWhatsapp: member.whatsapp,
    startDate: startDate,
    endDate: endDate,
    days: days,
    reason: reason,
    status: 'pending',
    requestDate: Date.now()
  };
  
  if (!appData.requests) {
    appData.requests = [];
  }
  
  appData.requests.push(vacationRequest);
  saveStorage(appData);
  
  alert(`✅ تم إرسال طلب الإجازة بنجاح!\nعدد الأيام: ${days} يوم`);
  closeVacationModal();
  document.getElementById('vacationForm').reset();
}

// ==========================================
// 4. RATINGS SYSTEM - نظام التقييم
// ==========================================

function rateMember(memberId) {
  const commitment = document.getElementById('ratingCommitment').value;
  const performance = document.getElementById('ratingPerformance').value;
  const cooperation = document.getElementById('ratingCooperation').value;
  const quality = document.getElementById('ratingQuality').value;
  const notes = document.getElementById('ratingNotes').value;
  
  if (!commitment || !performance || !cooperation || !quality) {
    alert('يرجى تقييم جميع المعايير!');
    return;
  }
  
  appData = getStorage();
  const member = appData.members.find(m => m.id === memberId);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  if (!member.ratings) {
    member.ratings = [];
  }
  
  const average = ((parseFloat(commitment) + parseFloat(performance) + 
                   parseFloat(cooperation) + parseFloat(quality)) / 4).toFixed(2);
  
  const rating = {
    id: Date.now(),
    ratedBy: appData.currentUser.name,
    ratedByRole: appData.currentUser.role,
    date: Date.now(),
    commitment: parseFloat(commitment),
    performance: parseFloat(performance),
    cooperation: parseFloat(cooperation),
    quality: parseFloat(quality),
    average: parseFloat(average),
    notes: notes
  };
  
  member.ratings.push(rating);
  
  // Update average rating
  const totalAvg = member.ratings.reduce((sum, r) => sum + r.average, 0) / member.ratings.length;
  member.averageRating = totalAvg.toFixed(2);
  
  saveStorage(appData);
  
  alert(`✅ تم تقييم الموظف بنجاح!\nالتقييم: ${average} من 5`);
  closeRatingModal();
  
  if (appData.currentUser.role === 'admin') {
    loadAdminDashboard();
  } else {
    loadLeaderDashboard();
  }
}

// ==========================================
// 5. NOTES AND WARNINGS - الملاحظات والإنذارات
// ==========================================

function addNote(memberId, type) {
  const noteText = document.getElementById('noteText').value;
  
  if (!noteText) {
    alert('يرجى كتابة الملاحظة!');
    return;
  }
  
  appData = getStorage();
  const member = appData.members.find(m => m.id === memberId);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  if (!member.notes) {
    member.notes = [];
  }
  
  const note = {
    id: Date.now(),
    type: type, // 'note' or 'warning'
    text: noteText,
    addedBy: appData.currentUser.name,
    addedByRole: appData.currentUser.role,
    date: Date.now()
  };
  
  member.notes.push(note);
  
  // Count warnings
  const warningsCount = member.notes.filter(n => n.type === 'warning').length;
  member.warningsCount = warningsCount;
  
  saveStorage(appData);
  
  const typeText = type === 'warning' ? 'إنذار' : 'ملاحظة';
  alert(`✅ تم إضافة ${typeText} بنجاح!`);
  
  closeNoteModal();
  viewMemberDetails(memberId);
}

// ==========================================
// 6. ADVANCED SEARCH - البحث المتقدم
// ==========================================

function searchMembers(searchTerm) {
  appData = getStorage();
  
  if (!searchTerm || searchTerm.trim() === '') {
    // Show all members
    if (appData.currentUser.role === 'leader') {
      loadMembersTable('all');
    } else {
      loadAdminMembersTable('all');
    }
    return;
  }
  
  const term = searchTerm.toLowerCase().trim();
  const filteredMembers = appData.members.filter(member => {
    return member.name.toLowerCase().includes(term) ||
           member.whatsapp.includes(term) ||
           member.email.toLowerCase().includes(term);
  });
  
  console.log('Search results:', filteredMembers.length);
  
  // Display filtered results
  displaySearchResults(filteredMembers);
}

function displaySearchResults(members) {
  const tbody = appData.currentUser.role === 'leader' ? 
                document.getElementById('membersTableBody') :
                document.getElementById('adminMembersTableBody');
  
  if (!tbody) return;
  
  if (members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">لا توجد نتائج</td></tr>';
    return;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  
  tbody.innerHTML = members.map(member => {
    let isPresent = false;
    if (member.checkIn && member.checkOut) {
      const [checkInHour] = member.checkIn.split(':').map(Number);
      const [checkOutHour] = member.checkOut.split(':').map(Number);
      isPresent = currentHour >= checkInHour && currentHour < checkOutHour;
    }
    
    const actions = appData.currentUser.role === 'admin' ? `
      <button class="btn-action btn-view" onclick="viewMemberDetails(${member.id})">
        <i class="fas fa-eye"></i> عرض
      </button>
      <button class="btn-action btn-edit" onclick="editUser('member', ${member.id})">
        <i class="fas fa-edit"></i> تعديل
      </button>
      <button class="btn-action btn-delete" onclick="deleteUser('member', ${member.id})">
        <i class="fas fa-trash"></i> حذف
      </button>
    ` : `
      <button class="btn-action btn-view" onclick="viewMemberDetails(${member.id})">
        <i class="fas fa-eye"></i> عرض
      </button>
    `;
    
    return `
      <tr>
        <td><strong>${member.name}</strong></td>
        <td>${member.whatsapp || '-'}</td>
        <td><span class="status-badge ${isPresent ? 'status-present' : 'status-absent'}">${isPresent ? 'حاضر' : 'منصرف'}</span></td>
        <td>${member.checkIn || '-'}</td>
        <td>${member.checkOut || '-'}</td>
        <td>
          <div class="action-buttons">
            ${actions}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 7. ACTIVITY LOG - سجل التحركات
// ==========================================

function logActivity(action, details) {
  appData = getStorage();
  
  if (!appData.activityLog) {
    appData.activityLog = [];
  }
  
  const log = {
    id: Date.now(),
    action: action,
    details: details,
    userId: appData.currentUser.id,
    userName: appData.currentUser.name,
    userRole: appData.currentUser.role,
    timestamp: Date.now()
  };
  
  appData.activityLog.push(log);
  
  // Keep only last 500 entries
  if (appData.activityLog.length > 500) {
    appData.activityLog = appData.activityLog.slice(-500);
  }
  
  saveStorage(appData);
}

function loadActivityLog() {
  appData = getStorage();
  
  if (!appData.activityLog) {
    appData.activityLog = [];
  }
  
  const container = document.getElementById('activityLogContainer');
  if (!container) return;
  
  if (appData.activityLog.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>لا يوجد سجل تحركات</p></div>';
    return;
  }
  
  const sortedLog = [...appData.activityLog].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  
  container.innerHTML = sortedLog.map(log => {
    const date = new Date(log.timestamp);
    const timeStr = date.toLocaleString('ar-EG');
    
    return `
      <div class="log-item">
        <div class="log-icon">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="log-details">
          <strong>${log.userName}</strong> <span class="log-role">(${log.userRole === 'admin' ? 'مدير' : log.userRole === 'leader' ? 'قائد' : 'موظف'})</span>
          <p>${log.action}: ${log.details}</p>
          <small>${timeStr}</small>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 8. REPORTS AND STATISTICS - التقارير
// ==========================================

function generateMonthlyReport(memberId) {
  appData = getStorage();
  const member = appData.members.find(m => m.id === memberId);
  
  if (!member || !member.attendance) {
    alert('لا توجد بيانات حضور لهذا الموظف');
    return;
  }
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyRecords = member.attendance.filter(a => {
    const recordDate = new Date(a.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });
  
  const totalDays = monthlyRecords.length;
  const onTimeDays = monthlyRecords.filter(a => a.status === 'onTime').length;
  const lateDays = monthlyRecords.filter(a => a.status === 'late').length;
  const earlyLeaveDays = monthlyRecords.filter(a => a.status === 'earlyLeave').length;
  const totalLateMinutes = monthlyRecords.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
  const totalWorkHours = monthlyRecords.reduce((sum, a) => sum + (parseFloat(a.workHours) || 0), 0);
  
  const report = {
    memberName: member.name,
    month: now.toLocaleString('ar-EG', { month: 'long', year: 'numeric' }),
    totalDays: totalDays,
    onTimeDays: onTimeDays,
    lateDays: lateDays,
    earlyLeaveDays: earlyLeaveDays,
    totalLateMinutes: totalLateMinutes,
    totalWorkHours: totalWorkHours.toFixed(2),
    averageWorkHours: (totalWorkHours / totalDays).toFixed(2),
    attendanceRate: ((onTimeDays / totalDays) * 100).toFixed(1)
  };
  
  displayMonthlyReport(report);
}

function displayMonthlyReport(report) {
  const modal = document.getElementById('reportModal');
  const content = document.getElementById('reportContent');
  
  content.innerHTML = `
    <h3>تقرير شهري - ${report.memberName}</h3>
    <h4>${report.month}</h4>
    <div class="report-stats">
      <div class="report-stat-item">
        <i class="fas fa-calendar-check"></i>
        <span>إجمالي أيام الحضور</span>
        <strong>${report.totalDays}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-check-circle"></i>
        <span>الحضور في الموعد</span>
        <strong>${report.onTimeDays}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-clock"></i>
        <span>أيام التأخير</span>
        <strong>${report.lateDays}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-door-open"></i>
        <span>انصراف مبكر</span>
        <strong>${report.earlyLeaveDays}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-hourglass-half"></i>
        <span>إجمالي دقائق التأخير</span>
        <strong>${report.totalLateMinutes}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-business-time"></i>
        <span>إجمالي ساعات العمل</span>
        <strong>${report.totalWorkHours}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-chart-line"></i>
        <span>متوسط ساعات العمل يومياً</span>
        <strong>${report.averageWorkHours}</strong>
      </div>
      <div class="report-stat-item">
        <i class="fas fa-percentage"></i>
        <span>نسبة الالتزام</span>
        <strong>${report.attendanceRate}%</strong>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

// ==========================================
// 9. SALARY SYSTEM - نظام الرواتب الأساسي
// ==========================================

function calculateSalary(memberId) {
  appData = getStorage();
  const member = appData.members.find(m => m.id === memberId);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  if (!member.baseSalary) {
    alert('لم يتم تحديد الراتب الأساسي لهذا الموظف');
    return;
  }
  
  const baseSalary = parseFloat(member.baseSalary);
  let deductions = 0;
  let bonuses = 0;
  
  // Calculate attendance-based deductions/bonuses
  if (member.attendance) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRecords = member.attendance.filter(a => {
      const recordDate = new Date(a.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    // Deduct for late days (5 EGP per late minute)
    const totalLateMinutes = monthlyRecords.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    deductions += totalLateMinutes * 5;
    
    // Deduct for early leave (10 EGP per early minute)
    const totalEarlyMinutes = monthlyRecords.reduce((sum, a) => sum + (a.earlyMinutes || 0), 0);
    deductions += totalEarlyMinutes * 10;
    
    // Bonus for perfect attendance (no late, no early leave)
    const perfectDays = monthlyRecords.filter(a => a.status === 'onTime' && !a.earlyMinutes).length;
    if (perfectDays === monthlyRecords.length && monthlyRecords.length >= 20) {
      bonuses += 500; // 500 EGP bonus for perfect attendance
    }
  }
  
  // Bonus for high rating
  if (member.averageRating >= 4.5) {
    bonuses += 1000;
  } else if (member.averageRating >= 4.0) {
    bonuses += 500;
  }
  
  // Deduct for warnings
  if (member.warningsCount >= 3) {
    deductions += 1000;
  } else if (member.warningsCount >= 2) {
    deductions += 500;
  } else if (member.warningsCount >= 1) {
    deductions += 200;
  }
  
  const finalSalary = baseSalary - deductions + bonuses;
  
  const salaryReport = {
    memberName: member.name,
    baseSalary: baseSalary,
    deductions: deductions,
    bonuses: bonuses,
    finalSalary: finalSalary
  };
  
  displaySalaryReport(salaryReport);
}

function displaySalaryReport(report) {
  const modal = document.getElementById('salaryModal');
  const content = document.getElementById('salaryContent');
  
  content.innerHTML = `
    <h3>تقرير الراتب - ${report.memberName}</h3>
    <div class="salary-breakdown">
      <div class="salary-item">
        <span>الراتب الأساسي</span>
        <strong class="salary-positive">${report.baseSalary} جنيه</strong>
      </div>
      <div class="salary-item">
        <span>المكافآت</span>
        <strong class="salary-positive">+ ${report.bonuses} جنيه</strong>
      </div>
      <div class="salary-item">
        <span>الخصومات</span>
        <strong class="salary-negative">- ${report.deductions} جنيه</strong>
      </div>
      <div class="salary-item salary-total">
        <span>صافي الراتب</span>
        <strong>${report.finalSalary} جنيه</strong>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

// ==========================================
// 10. DARK MODE - الوضع الليلي
// ==========================================

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark-mode');
  
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  
  const icon = document.querySelector('.dark-mode-toggle i');
  if (icon) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Initialize dark mode on load
function initDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.documentElement.classList.add('dark-mode');
    const icon = document.querySelector('.dark-mode-toggle i');
    if (icon) {
      icon.className = 'fas fa-sun';
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Update member login/logout to log activity
const originalMemberLogin = handleMemberLogin;
handleMemberLogin = function() {
  originalMemberLogin.apply(this, arguments);
  if (appData.currentUser && appData.currentUser.role === 'member') {
    logActivity('تسجيل دخول', `الموظف ${appData.currentUser.name} سجل دخول`);
  }
};

// Export enhanced data
function exportEnhancedData() {
  appData = getStorage();
  
  if (appData.members.length === 0) {
    alert('لا يوجد بيانات لتصديرها!');
    return;
  }
  
  let csvContent = '\uFEFF'; // UTF-8 BOM
  
  // Headers
  csvContent += 'الاسم,الواتساب,الإيميل,يوم الإجازة,وقت الحضور,وقت الانصراف,الراتب الأساسي,التقييم,عدد الإنذارات,أيام الحضور\n';
  
  // Data rows
  appData.members.forEach(member => {
    const attendanceDays = member.attendance ? member.attendance.length : 0;
    const rating = member.averageRating || '-';
    const warnings = member.warningsCount || 0;
    const salary = member.baseSalary || '-';
    
    csvContent += `${member.name},${member.whatsapp},${member.email},${member.dayOff},${member.checkIn},${member.checkOut},${salary},${rating},${warnings},${attendanceDays}\n`;
  });
  
  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
  link.setAttribute('href', url);
  link.setAttribute('download', `بيانات_كاملة_${date}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert('✅ تم تصدير البيانات الكاملة بنجاح!');
  logActivity('تصدير بيانات', 'تم تصدير جميع البيانات إلى ملف Excel');
}

// ==========================================
// COMPREHENSIVE TASKS DASHBOARD FOR ADMIN
// ==========================================

function loadComprehensiveTasksDashboard() {
  console.log('=== Loading Comprehensive Tasks Dashboard ===');
  appData = getStorage();
  
  if (!appData.tasks) {
    appData.tasks = [];
  }
  
  console.log('Total tasks in system:', appData.tasks.length);
  
  // Calculate task statistics
  const totalTasks = appData.tasks.length;
  const pendingTasks = appData.tasks.filter(t => !t.status || t.status === 'pending').length;
  const inProgressTasks = appData.tasks.filter(t => t.status === 'inProgress').length;
  const completedTasks = appData.tasks.filter(t => t.status === 'completed').length;
  
  console.log('Tasks breakdown:', {
    total: totalTasks,
    pending: pendingTasks,
    inProgress: inProgressTasks,
    completed: completedTasks
  });
  
  // Update stats
  const totalEl = document.getElementById('totalTasksCount');
  const pendingEl = document.getElementById('pendingTasksCount');
  const inProgressEl = document.getElementById('inProgressTasksCount');
  const completedEl = document.getElementById('completedTasksCount');
  
  if (totalEl) totalEl.textContent = totalTasks;
  if (pendingEl) pendingEl.textContent = pendingTasks;
  if (inProgressEl) inProgressEl.textContent = inProgressTasks;
  if (completedEl) completedEl.textContent = completedTasks;
  
  // Display all tasks
  displayComprehensiveTasks(appData.tasks);
  
  console.log('=== Comprehensive Tasks Dashboard Loaded ===');
}

function displayComprehensiveTasks(tasks) {
  const container = document.getElementById('comprehensiveTasksList');
  
  if (!container) {
    console.error('comprehensiveTasksList container not found!');
    return;
  }
  
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 60px 20px; text-align: center;">
        <i class="fas fa-tasks" style="font-size: 64px; color: var(--accent); opacity: 0.3; margin-bottom: 20px;"></i>
        <h3 style="color: var(--text-primary); margin-bottom: 10px;">لا توجد مهام حالياً</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">ابدأ بإسناد مهام للموظفين من قسم "إسناد مهمة جديدة" أعلاه</p>
      </div>
    `;
    return;
  }
  
  console.log('Displaying', tasks.length, 'tasks');
  
  // Sort by date (newest first)
  const sortedTasks = [...tasks].sort((a, b) => b.date - a.date);
  
  container.innerHTML = sortedTasks.map(task => {
    const status = task.status || 'pending';
    const statusText = {
      'pending': 'قيد الانتظار',
      'inProgress': 'قيد التنفيذ',
      'completed': 'مكتملة'
    };
    
    const date = new Date(task.date);
    const dateStr = date.toLocaleDateString('ar-EG');
    const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    let completedInfo = '';
    if (task.completedAt) {
      const completedDate = new Date(task.completedAt);
      const completedStr = completedDate.toLocaleDateString('ar-EG') + ' ' + 
                          completedDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      completedInfo = `
        <div class="task-comprehensive-meta-item">
          <i class="fas fa-check-circle"></i>
          <span>اكتملت: ${completedStr}</span>
        </div>
      `;
    }
    
    return `
      <div class="task-comprehensive-card">
        <div class="task-comprehensive-header">
          <div>
            <div class="task-comprehensive-title">${task.details}</div>
            <span class="task-type-badge">${task.type}</span>
          </div>
          <span class="task-status-badge-large ${status}">${statusText[status]}</span>
        </div>
        
        <div class="task-comprehensive-meta">
          <div class="task-comprehensive-meta-item">
            <i class="fas fa-user"></i>
            <span>${task.memberName}</span>
          </div>
          <div class="task-comprehensive-meta-item">
            <i class="fas fa-user-tie"></i>
            <span>أسندها: ${task.assignedBy}</span>
          </div>
          <div class="task-comprehensive-meta-item">
            <i class="fas fa-calendar"></i>
            <span>${dateStr}</span>
          </div>
          <div class="task-comprehensive-meta-item">
            <i class="fas fa-clock"></i>
            <span>${timeStr}</span>
          </div>
          ${completedInfo}
        </div>
      </div>
    `;
  }).join('');
}

function filterAdminTasks(filter) {
  appData = getStorage();
  
  let filteredTasks = appData.tasks;
  
  if (filter === 'pending') {
    filteredTasks = appData.tasks.filter(t => !t.status || t.status === 'pending');
  } else if (filter === 'inProgress') {
    filteredTasks = appData.tasks.filter(t => t.status === 'inProgress');
  } else if (filter === 'completed') {
    filteredTasks = appData.tasks.filter(t => t.status === 'completed');
  }
  
  displayComprehensiveTasks(filteredTasks);
}

// ==========================================
// ADMIN SIDEBAR TAB SWITCHING
// ==========================================

function showAdminTab(tabName) {
  // Hide all content sections first
  const allSections = document.querySelectorAll('.content-section');
  allSections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Remove active class from all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to clicked sidebar item
  event.target.closest('.sidebar-item').classList.add('active');
  
  // Show relevant sections based on tab
  switch(tabName) {
    case 'overview':
      // Show statistics sections
      document.querySelectorAll('.stats-grid-enhanced, .stats-grid').forEach(section => {
        section.style.display = 'grid';
      });
      break;
      
    case 'employees':
      // Show employees table section
      const employeesSection = Array.from(allSections).find(section => 
        section.querySelector('#adminMembersTableBody')
      );
      if (employeesSection) {
        employeesSection.style.display = 'block';
      }
      break;
      
    case 'tasks':
      // Show task sections
      const taskAssignSection = Array.from(allSections).find(section =>
        section.querySelector('#adminTaskForm')
      );
      const comprehensiveTasksSection = Array.from(allSections).find(section =>
        section.querySelector('#comprehensiveTasksList')
      );
      if (taskAssignSection) taskAssignSection.style.display = 'block';
      if (comprehensiveTasksSection) comprehensiveTasksSection.style.display = 'block';
      break;
      
    case 'users':
      // Show user management section
      const usersSection = Array.from(allSections).find(section =>
        section.querySelector('#adminTableBody')
      );
      if (usersSection) {
        usersSection.style.display = 'block';
      }
      break;
      
    case 'requests':
      // Show requests section
      const requestsSection = Array.from(allSections).find(section =>
        section.querySelector('#adminRequests')
      );
      if (requestsSection) {
        requestsSection.style.display = 'block';
      }
      break;
      
    case 'reports':
      // Show all sections for reports view
      allSections.forEach(section => {
        section.style.display = 'block';
      });
      alert('قسم التقارير - سيتم إضافة تقارير مخصصة قريباً');
      break;
      
    case 'activity':
      // Show activity log section
      const activitySection = Array.from(allSections).find(section =>
        section.querySelector('#activityLogContainer')
      );
      if (activitySection) {
        activitySection.style.display = 'block';
      }
      loadActivityLog();
      break;
      
    case 'settings':
      // Show backup section
      const backupSection = Array.from(allSections).find(section =>
        section.textContent.includes('النسخ الاحتياطي والاسترجاع')
      );
      if (backupSection) {
        backupSection.style.display = 'block';
      }
      break;
  }
  
  return false;
}

// Update requests count badge
function updateSidebarBadge() {
  const appData = getStorage();
  const pendingRequests = (appData.requests || []).filter(r => r.status === 'pending').length;
  const badge = document.getElementById('sidebarRequestsCount');
  if (badge) {
    badge.textContent = pendingRequests;
    badge.style.display = pendingRequests > 0 ? 'block' : 'none';
  }
}

// ==========================================
// ENHANCED CHECK IN/OUT SYSTEM
// ==========================================

// Update recordCheckIn to log activity and not logout
const originalRecordCheckIn = recordCheckIn;
recordCheckIn = function() {
  appData = getStorage();
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Initialize attendance array if not exists
  if (!member.attendance) {
    member.attendance = [];
  }
  
  // Check if already checked in today
  const todayRecord = member.attendance.find(a => a.date === currentDate);
  if (todayRecord && todayRecord.actualCheckIn) {
    alert('لقد سجلت حضورك اليوم بالفعل!');
    return;
  }
  
  // Calculate if late
  const [scheduledHour, scheduledMin] = member.checkIn.split(':').map(Number);
  const [actualHour, actualMin] = currentTime.split(':').map(Number);
  const scheduledMinutes = scheduledHour * 60 + scheduledMin;
  const actualMinutes = actualHour * 60 + actualMin;
  const lateMinutes = Math.max(0, actualMinutes - scheduledMinutes);
  
  const attendanceRecord = {
    date: currentDate,
    actualCheckIn: currentTime,
    scheduledCheckIn: member.checkIn,
    lateMinutes: lateMinutes,
    status: lateMinutes > 0 ? 'late' : 'onTime',
    checkedInBy: member.name
  };
  
  if (todayRecord) {
    Object.assign(todayRecord, attendanceRecord);
  } else {
    member.attendance.push(attendanceRecord);
  }
  
  saveStorage(appData);
  
  // Log activity
  logActivity('تسجيل حضور', `${member.name} سجل حضوره الساعة ${currentTime}`);
  
  if (lateMinutes > 0) {
    alert(`✅ تم تسجيل الحضور!\n⚠️ تأخرت ${lateMinutes} دقيقة`);
  } else {
    alert('✅ تم تسجيل الحضور في الموعد!');
  }
  
  loadMemberDashboard();
};

// Update recordCheckOut to log activity and not logout
const originalRecordCheckOut = recordCheckOut;
recordCheckOut = function() {
  appData = getStorage();
  const member = appData.members.find(m => m.id === appData.currentUser.id);
  
  if (!member) {
    alert('حدث خطأ!');
    return;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDate = now.toISOString().split('T')[0];
  
  if (!member.attendance) {
    member.attendance = [];
  }
  
  const todayRecord = member.attendance.find(a => a.date === currentDate);
  
  if (!todayRecord || !todayRecord.actualCheckIn) {
    alert('يجب تسجيل الحضور أولاً!');
    return;
  }
  
  if (todayRecord.actualCheckOut) {
    alert('لقد سجلت انصرافك اليوم بالفعل!');
    return;
  }
  
  // Calculate if early leave
  const [scheduledHour, scheduledMin] = member.checkOut.split(':').map(Number);
  const [actualHour, actualMin] = currentTime.split(':').map(Number);
  const scheduledMinutes = scheduledHour * 60 + scheduledMin;
  const actualMinutes = actualHour * 60 + actualMin;
  const earlyMinutes = Math.max(0, scheduledMinutes - actualMinutes);
  
  todayRecord.actualCheckOut = currentTime;
  todayRecord.scheduledCheckOut = member.checkOut;
  todayRecord.earlyMinutes = earlyMinutes;
  
  if (earlyMinutes > 0) {
    todayRecord.status = 'earlyLeave';
  }
  
  // Calculate total work hours
  const checkInMinutes = parseInt(todayRecord.actualCheckIn.split(':')[0]) * 60 + 
                        parseInt(todayRecord.actualCheckIn.split(':')[1]);
  const checkOutMinutes = actualHour * 60 + actualMin;
  todayRecord.workHours = ((checkOutMinutes - checkInMinutes) / 60).toFixed(2);
  
  saveStorage(appData);
  
  // Log activity
  logActivity('تسجيل انصراف', `${member.name} سجل انصرافه الساعة ${currentTime} (${todayRecord.workHours} ساعة عمل)`);
  
  if (earlyMinutes > 0) {
    alert(`✅ تم تسجيل الانصراف!\n⚠️ انصرفت مبكراً ${earlyMinutes} دقيقة`);
  } else {
    alert(`✅ تم تسجيل الانصراف!\n⏱️ عملت ${todayRecord.workHours} ساعة اليوم`);
  }
  
  loadMemberDashboard();
};

// ==========================================
// BACKUP AND RESTORE SYSTEM
// ==========================================

function createBackup() {
  const appData = getStorage();
  
  // Create backup object with timestamp
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: appData
  };
  
  // Convert to JSON
  const jsonStr = JSON.stringify(backup, null, 2);
  
  // Create file and download
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  const date = new Date();
  const filename = `backup_${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}-${date.getMinutes().toString().padStart(2,'0')}.json`;
  
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  logActivity('نسخة احتياطية', 'تم إنشاء نسخة احتياطية من البيانات');
  alert(`✅ تم إنشاء النسخة الاحتياطية!\n\nاسم الملف: ${filename}\n\nاحفظه في مكان آمن!`);
}

function restoreBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const backup = JSON.parse(event.target.result);
        
        // Validate backup
        if (!backup.data || !backup.version) {
          alert('❌ ملف النسخة الاحتياطية غير صالح!');
          return;
        }
        
        // Confirm restore
        const backupDate = new Date(backup.timestamp).toLocaleString('ar-EG');
        const confirm = window.confirm(
          `هل تريد استرجاع النسخة الاحتياطية؟\n\n` +
          `تاريخ النسخة: ${backupDate}\n\n` +
          `⚠️ تحذير: سيتم استبدال جميع البيانات الحالية!`
        );
        
        if (!confirm) return;
        
        // Restore data
        localStorage.setItem('employeeSystem', JSON.stringify(backup.data));
        
        logActivity('استرجاع نسخة احتياطية', `تم استرجاع نسخة احتياطية من ${backupDate}`);
        
        alert('✅ تم استرجاع النسخة الاحتياطية بنجاح!\n\nسيتم إعادة تحميل الصفحة...');
        location.reload();
        
      } catch (error) {
        console.error('Restore error:', error);
        alert('❌ حدث خطأ أثناء استرجاع النسخة الاحتياطية!\n\nتأكد من أن الملف صحيح.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

function autoBackup() {
  // Check if we should create auto backup
  const lastBackup = localStorage.getItem('lastAutoBackup');
  const now = Date.now();
  
  // Auto backup every 24 hours
  if (!lastBackup || (now - parseInt(lastBackup)) > 24 * 60 * 60 * 1000) {
    const appData = getStorage();
    
    // Save to separate localStorage key
    localStorage.setItem('autoBackup', JSON.stringify({
      timestamp: now,
      data: appData
    }));
    
    localStorage.setItem('lastAutoBackup', now.toString());
    console.log('✅ Auto backup created');
  }
}

// Run auto backup on load
autoBackup();

console.log('✅ Enhanced features loaded successfully!');
