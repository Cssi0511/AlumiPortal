// ============================================
// CSSI 05/11 ALUMNI ASSOCIATION - OPTIMIZED SCRIPT
// ============================================
// Version: 2.0 (Optimized)
// Last Updated: January 2025

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  SHEET_NAME: "Form Responses 1",
  LOGIN_SHEET_NAME: "login",
  EMAIL_COLUMN: 2,
  MEMBER_ID_COLUMN: 25,
  ID_PREFIX: "CSSI0511",
  CACHE_DURATION: 3600, // 1 hour in seconds
  BATCH_SIZE: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // milliseconds
};

// Column mapping - centralized for easy maintenance
const COLUMNS = {
  TIMESTAMP: 1,
  EMAIL: 2,
  FULL_NAME: 3,
  DATE_OF_BIRTH: 4,
  GENDER: 5,
  PHONE_NUMBER: 6,
  YEAR_OF_GRADUATION: 7,
  HOUSE: 8,
  CLASS: 9,
  CITY: 10,
  STATE_PROVINCE: 11,
  COUNTRY: 12,
  CURRENT_OCCUPATION: 13,
  INDUSTRY_FIELD: 14,
  COMPANY_ORGANIZATION: 15,
  LINKEDIN_PROFILE: 16,
  ACTIVELY_INVOLVED: 17,
  COMMITTEE_PREFERENCE: 18,
  MEMBERSHIP_DUES: 19,
  SUSTAINABLE_AMOUNT: 20,
  EMERGENCY_FULL_NAME: 21,
  EMERGENCY_RELATIONSHIP: 22,
  EMERGENCY_PHONE: 23,
  DECLARATION: 24,
  MEMBER_ID: 25,
  VERIFICATION: 26,
  ROLE: 27
};

// ============================================
// CORE FORM SUBMISSION HANDLER
// ============================================

/**
 * Optimized form submission handler with error recovery
 */
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 30 seconds for lock
    lock.waitLock(30000);
    
    if (!e || !e.values) {
      Logger.log("❌ Error: No form data received.");
      return;
    }

    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    const timestamp = e.values[0];
    const email = e.values[1];
    const name = e.values[2];

    // Check for duplicate before processing
    if (isDuplicateEmailFast(email)) {
      Logger.log(`⚠️ Duplicate email detected: ${email}. Skipping.`);
      return;
    }

    // Do not generate Member ID immediately
    const memberId = "Pending";
    
    // Save Member ID in Column Y, Verification = false, Role = user
    sheet.getRange(lastRow, CONFIG.MEMBER_ID_COLUMN).setValue(memberId);
    sheet.getRange(lastRow, COLUMNS.VERIFICATION).setValue(false);
    sheet.getRange(lastRow, COLUMNS.ROLE).setValue("user");
    
    // Clear cache after new addition
    clearUserCache();
    
    Logger.log(`✅ Processed form submission for: ${email} | Status: Pending Verification`);
    
  } catch (error) {
    Logger.log(`❌ Error in onFormSubmit: ${error.toString()}`);
    logError('onFormSubmit', error, { email: e.values[1] });
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// OPTIMIZED MEMBER ID GENERATION
// ============================================

/**
 * Optimized Member ID generation with caching
 */
function generateSequentialMemberIdOptimized() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'last_member_id';
  
  // Try to get from cache first
  let cachedId = cache.get(cacheKey);
  
  if (cachedId) {
    const number = parseInt(cachedId.substring(CONFIG.ID_PREFIX.length), 10);
    const nextNumber = number + 1;
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    const newId = CONFIG.ID_PREFIX + formattedNumber;
    
    // Update cache
    cache.put(cacheKey, newId, CONFIG.CACHE_DURATION);
    return newId;
  }
  
  // If not in cache, calculate from sheet (only once per hour)
  const sheet = getSheet();
  const memberIdRange = sheet.getRange(2, CONFIG.MEMBER_ID_COLUMN, sheet.getLastRow() - 1, 1);
  const values = memberIdRange.getValues();
  
  let highestNumber = 0;
  
  // Optimized loop - filter empty values first
  values
    .filter(row => row[0] && typeof row[0] === 'string' && row[0].startsWith(CONFIG.ID_PREFIX))
    .forEach(row => {
      const numericPart = row[0].substring(CONFIG.ID_PREFIX.length);
      const number = parseInt(numericPart, 10);
      if (!isNaN(number) && number > highestNumber) {
        highestNumber = number;
      }
    });
  
  const nextNumber = highestNumber + 1;
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  const newId = CONFIG.ID_PREFIX + formattedNumber;
  
  // Cache the result
  cache.put(cacheKey, newId, CONFIG.CACHE_DURATION);
  
  return newId;
}

// ============================================
// OPTIMIZED EMAIL FUNCTIONS
// ============================================

/**
 * Async email sending with retry logic
 */
function sendWelcomeEmailAsync(email, name, memberId) {
  const maxRetries = CONFIG.MAX_RETRIES;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return sendWelcomeEmail(email, name, memberId);
    } catch (error) {
      attempt++;
      Logger.log(`⚠️ Email send attempt ${attempt} failed: ${error.toString()}`);
      
      if (attempt >= maxRetries) {
        Logger.log(`❌ Failed to send email after ${maxRetries} attempts`);
        logError('sendWelcomeEmail', error, { email, memberId });
        return false;
      }
      
      Utilities.sleep(CONFIG.RETRY_DELAY * attempt);
    }
  }
  
  return false;
}

/**
 * Optimized welcome email sender
 */
function sendWelcomeEmail(email, name, memberId) {
  const subject = "Welcome to CSSI 05/11 Alumni Association!";
  
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center;">
          <h2 style="color: #0056b3;">Welcome to CSSI 05/11 Alumni Association!</h2>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are excited to officially welcome you to the <strong>CSSI 05/11 Alumni Association</strong>.</p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">Your Unique Member ID: <strong style="color: #d9534f; font-size: 16px;">${memberId}</strong></p>
        </div>

        <p>As a member, you will have access to:</p>
        <ul style="padding-left: 20px;">
          <li>Networking Opportunities</li>
          <li>Exclusive Alumni Events</li>
          <li>Career Mentorship & Support</li>
          <li>Community Development Initiatives</li>
        </ul>

        <p>We encourage you to stay active and participate in upcoming programs.</p>

        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>Best Regards,</p>
          <p><strong>CSSI 05/11 Alumni Team</strong></p>
        </div>
      </body>
    </html>
  `;
  
  GmailApp.sendEmail(email, subject, `Welcome! Your Member ID: ${memberId}`, { 
    htmlBody: htmlBody,
    name: "CSSI 05/11 Alumni Association"
  });
  
  Logger.log(`✅ Email sent successfully to ${email}`);
  return true;
}



/**
 * Optimized birthday email sender with batching
 */
function sendBirthdayEmails() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;
  const ccEmail = "cssi0511official@gmail.com";
  
  const birthdayUsers = [];
  
  // First pass - identify birthday users
  for (let i = 1; i < data.length; i++) {
    const email = data[i][1];
    const name = data[i][2];
    const dob = new Date(data[i][3]);
    const dobStr = `${dob.getMonth() + 1}/${dob.getDate()}`;

    if (dobStr === todayStr && email) {
      birthdayUsers.push({ email, name });
    }
  }
  
  // Send emails in batches
  birthdayUsers.forEach((user, index) => {
    try {
      const subject = `Happy Birthday, ${user.name}! 🎉`;
      const message = `Dear ${user.name},

  🎂 Happy Birthday from all of us at CSSI 05/11 Association! 🎊

  On this special day, we celebrate you and all the amazing things you bring to our community. May your day be filled with joy, laughter, and wonderful moments!

  Wishing you a fantastic year ahead!

  Best Regards,
  CSSI 05/11 Association 🎈`;

      MailApp.sendEmail({
        to: user.email,
        cc: ccEmail,
        subject: subject,
        body: message
      });
      
      Logger.log(`✅ Birthday email sent to: ${user.email}`);
      
      // Avoid rate limits - delay between emails
      if ((index + 1) % 10 === 0) {
        Utilities.sleep(1000);
      }
      
    } catch (error) {
      Logger.log(`❌ Error sending birthday email to ${user.email}: ${error.toString()}`);
    }
  });
  
  Logger.log(`📊 Birthday emails sent: ${birthdayUsers.length}`);
}

/**
 * Optimized bulk email sender with progress tracking
 */
function sendNewYearEmails() {
  const SHEET_NAME = "mailing";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log(`❌ Sheet "${SHEET_NAME}" not found`);
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const subject = "Happy New Year from CSSI Alumni Association";
  let sentCount = 0;
  
  for (let i = 1; i < data.length && sentCount < CONFIG.BATCH_SIZE; i++) {
    const name = data[i][0];
    const email = data[i][1];
    const sentStatus = data[i][2];

    if (!email || sentStatus === "SENT") continue;

    try {
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; font-size:14px; line-height:1.6;">
          <p>Dear <strong>${name || "Esteemed Alumni"}</strong>,</p>
          <p>Happy New Year to you and your family.</p>
          <p>As we welcome a new year, I extend warm greetings and sincere best wishes to every member of the <strong>CSSI Alumni Association</strong>. We are grateful for your support, cooperation, and commitment, which contributed greatly to the progress and achievements recorded in the past year.</p>
          <p>The new year presents fresh opportunities to strengthen our unity, deepen engagement, and build on the solid foundation we have established together. With continued collaboration and shared purpose, we are confident that the CSSI Alumni Association will achieve even greater milestones ahead.</p>
          <p>May this new year bring you good health, peace, prosperity, and success in all your endeavors.</p>
          <p>Thank you for being an integral part of our alumni community. We look forward to your continued support in the year ahead.</p>
          <p style="margin-top:20px;">
            Warm regards,<br>
            <strong>Ilori Victor</strong><br>
            President<br>
            CSSI 05/11 Alumni Association
          </p>
        </div>
      `;

      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody,
        name: "CSSI 05/11 Alumni Association"
      });

      sheet.getRange(i + 1, 3).setValue("SENT");
      sentCount++;
      
      // Delay every 10 emails to avoid rate limits
      if (sentCount % 10 === 0) {
        Utilities.sleep(1000);
      }
      
    } catch (error) {
      Logger.log(`❌ Error sending email to ${email}: ${error.toString()}`);
      sheet.getRange(i + 1, 3).setValue("ERROR");
    }
  }

  Logger.log(`📊 ${sentCount} emails sent successfully.`);
}

// ============================================
// OPTIMIZED API FUNCTIONS
// ============================================

/**
 * Optimized user addition with transaction-like behavior
 */
function addUser(userData) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000);
    
    // Fast validation
    const validation = validateUserDataOptimized(userData);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message,
        errors: validation.errors
      };
    }

    // Fast duplicate check
    if (isDuplicateEmailFast(userData.email)) {
      const existingUser = getUserByEmailFast(userData.email);
      return {
        success: false,
        message: "User with this email already exists",
        existingUser: existingUser.user,
        rowNumber: existingUser.rowNumber
      };
    }

    const sheet = getSheet();
    const newRow = sheet.getLastRow() + 1;
    const memberId = "Pending"; // Generate ID only on verification
    const rowData = prepareRowData(userData, memberId);
    
    // Single write operation
    sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Clear cache
    clearUserCache();
    
    return {
      success: true,
      message: "User added successfully, pending verification",
      memberId: memberId,
      rowNumber: newRow,
      emailSent: false
    };
    
  } catch (error) {
    Logger.log(`❌ Error in addUser: ${error.toString()}`);
    logError('addUser', error, userData);
    return {
      success: false,
      message: `Error adding user: ${error.toString()}`
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Optimized user editing with minimal reads
 */
function editUser(identifier, updates) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000);
    
    const userLocation = findUserOptimized(identifier);
    
    if (!userLocation.found) {
      return { success: false, message: "User not found" };
    }

    // Check email conflict if email is being updated
    if (updates.email && updates.email !== userLocation.currentEmail) {
      if (isDuplicateEmailFast(updates.email)) {
        return {
          success: false,
          message: "Email already exists for another user"
        };
      }
    }

    const sheet = getSheet();
    const rowNumber = userLocation.row;
    const updatedFields = [];
    
    // Batch updates
    const updateOperations = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const columnIndex = getColumnIndexForField(key);
      if (columnIndex > 0) {
        updateOperations.push({
          range: sheet.getRange(rowNumber, columnIndex),
          value: value
        });
        updatedFields.push(key);
      }
    }
    
    // Execute all updates
    updateOperations.forEach(op => op.range.setValue(op.value));
    
    // Clear cache
    clearUserCache();

    return {
      success: true,
      message: "User updated successfully",
      rowNumber: rowNumber,
      updatedFields: updatedFields
    };
    
  } catch (error) {
    Logger.log(`❌ Error in editUser: ${error.toString()}`);
    return {
      success: false,
      message: `Error updating user: ${error.toString()}`
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Optimized user retrieval with caching
 */
function getUser(identifier) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = `user_${identifier.toLowerCase()}`;
    
    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const userLocation = findUserOptimized(identifier);
    
    if (!userLocation.found) {
      return { success: false, message: "User not found" };
    }

    const sheet = getSheet();
    const rowData = sheet.getRange(userLocation.row, 1, 1, 27).getValues()[0];
    
    const result = {
      success: true,
      user: formatUserData(rowData),
      rowNumber: userLocation.row
    };
    
    // Cache the result
    cache.put(cacheKey, JSON.stringify(result), 600); // 10 minutes
    
    return result;
    
  } catch (error) {
    Logger.log(`❌ Error in getUser: ${error.toString()}`);
    return {
      success: false,
      message: `Error retrieving user: ${error.toString()}`
    };
  }
}

/**
 * Optimized user deletion
 */
function deleteUser(identifier) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000);
    
    const userLocation = findUserOptimized(identifier);
    
    if (!userLocation.found) {
      return { success: false, message: "User not found" };
    }

    const sheet = getSheet();
    sheet.deleteRow(userLocation.row);
    
    // Clear cache
    clearUserCache();
    
    return {
      success: true,
      message: "User deleted successfully",
      deletedRow: userLocation.row
    };
    
  } catch (error) {
    Logger.log(`❌ Error in deleteUser: ${error.toString()}`);
    return {
      success: false,
      message: `Error deleting user: ${error.toString()}`
    };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// OPTIMIZED HELPER FUNCTIONS
// ============================================

/**
 * Cached sheet retrieval
 */
function getSheet() {
  const cache = CacheService.getScriptCache();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(CONFIG.SHEET_NAME) || spreadsheet.getActiveSheet();
}

/**
 * Fast duplicate email check using getDisplayValues (faster than getValues)
 */
function isDuplicateEmailFast(email) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) return false;
  
  const emailColumn = sheet.getRange(2, CONFIG.EMAIL_COLUMN, lastRow - 1, 1).getDisplayValues();
  const normalizedEmail = email.toLowerCase().trim();
  
  return emailColumn.some(row => row[0].toLowerCase().trim() === normalizedEmail);
}

/**
 * Optimized user search with early exit
 */
function findUserOptimized(identifier) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return { found: false };
  }
  
  const isEmail = identifier.includes('@');
  const columnToSearch = isEmail ? CONFIG.EMAIL_COLUMN : CONFIG.MEMBER_ID_COLUMN;
  const searchColumn = sheet.getRange(2, columnToSearch, lastRow - 1, 1).getDisplayValues();
  const normalizedIdentifier = identifier.toLowerCase().trim();
  
  for (let i = 0; i < searchColumn.length; i++) {
    if (searchColumn[i][0].toLowerCase().trim() === normalizedIdentifier) {
      const row = i + 2;
      const emailValue = sheet.getRange(row, CONFIG.EMAIL_COLUMN).getValue();
      
      return {
        found: true,
        row: row,
        currentEmail: emailValue
      };
    }
  }
  
  return { found: false };
}

/**
 * Fast user retrieval by email
 */
function getUserByEmailFast(email) {
  const userLocation = findUserOptimized(email);
  if (!userLocation.found) return null;
  
  const sheet = getSheet();
  const rowData = sheet.getRange(userLocation.row, 1, 1, 27).getValues()[0];
  
  return {
    user: formatUserData(rowData),
    rowNumber: userLocation.row
  };
}

/**
 * Optimized validation with early returns
 */
function validateUserDataOptimized(userData) {
  const errors = [];
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push("Valid email address is required");
  }
  
  if (!userData.fullName?.trim()) {
    errors.push("Full name is required");
  }
  
  if (!userData.dateOfBirth) {
    errors.push("Date of birth is required");
  }
  
  if (!userData.phoneNumber?.trim()) {
    errors.push("Phone number is required");
  }
  
  if (userData.linkedinProfile && !isValidUrl(userData.linkedinProfile)) {
    errors.push("Invalid LinkedIn URL");
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? "Validation failed" : "Valid",
    errors: errors
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Email validation using regex
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * URL validation
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Clear user-related caches
 */
function clearUserCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('last_member_id');
  // Note: Individual user caches will expire naturally
}

/**
 * Error logging to sheet
 */
function logError(functionName, error, context = {}) {
  try {
    const errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Errors') ||
                       SpreadsheetApp.getActiveSpreadsheet().insertSheet('Errors');
    
    errorSheet.appendRow([
      new Date(),
      functionName,
      error.toString(),
      JSON.stringify(context),
      Session.getActiveUser().getEmail()
    ]);
  } catch (e) {
    Logger.log(`Failed to log error: ${e.toString()}`);
  }
}

/**
 * Prepare row data (unchanged but included for completeness)
 */
function prepareRowData(userData, memberId) {
  return [
    new Date(),
    userData.email || "",
    userData.fullName || "",
    userData.dateOfBirth || "",
    userData.gender || "",
    userData.phoneNumber || "",
    userData.yearOfGraduation || "",
    userData.house || "",
    userData.class || "",
    userData.city || "",
    userData.stateProvince || "",
    userData.country || "",
    userData.currentOccupation || "",
    userData.industryField || "",
    userData.companyOrganization || "",
    userData.linkedinProfile || "",
    userData.activelyInvolved || "",
    userData.committeePreference || "",
    userData.membershipDues || "",
    userData.sustainableAmount || "",
    userData.emergencyFullName || "",
    userData.emergencyRelationship || "",
    userData.emergencyPhone || "",
    userData.declaration || "",
    memberId,
    false, // VERIFICATION default
    "user" // ROLE default
  ];
}

/**
 * Format user data
 */
function formatUserData(rowData) {
  return {
    timestamp: rowData[0],
    email: rowData[1],
    fullName: rowData[2],
    dateOfBirth: rowData[3],
    gender: rowData[4],
    phoneNumber: rowData[5],
    yearOfGraduation: rowData[6],
    house: rowData[7],
    class: rowData[8],
    city: rowData[9],
    stateProvince: rowData[10],
    country: rowData[11],
    currentOccupation: rowData[12],
    industryField: rowData[13],
    companyOrganization: rowData[14],
    linkedinProfile: rowData[15],
    activelyInvolved: rowData[16],
    committeePreference: rowData[17],
    membershipDues: rowData[18],
    sustainableAmount: rowData[19],
    emergencyFullName: rowData[20],
    emergencyRelationship: rowData[21],
    emergencyPhone: rowData[22],
    declaration: rowData[23],
    memberId: rowData[24],
    verification: rowData[25],
    role: rowData[26]
  };
}

/**
 * Get column index for field
 */
function getColumnIndexForField(fieldName) {
  const fieldMap = {
    'email': COLUMNS.EMAIL,
    'fullName': COLUMNS.FULL_NAME,
    'dateOfBirth': COLUMNS.DATE_OF_BIRTH,
    'gender': COLUMNS.GENDER,
    'phoneNumber': COLUMNS.PHONE_NUMBER,
    'yearOfGraduation': COLUMNS.YEAR_OF_GRADUATION,
    'house': COLUMNS.HOUSE,
    'class': COLUMNS.CLASS,
    'city': COLUMNS.CITY,
    'stateProvince': COLUMNS.STATE_PROVINCE,
    'country': COLUMNS.COUNTRY,
    'currentOccupation': COLUMNS.CURRENT_OCCUPATION,
    'industryField': COLUMNS.INDUSTRY_FIELD,
    'companyOrganization': COLUMNS.COMPANY_ORGANIZATION,
    'linkedinProfile': COLUMNS.LINKEDIN_PROFILE,
    'activelyInvolved': COLUMNS.ACTIVELY_INVOLVED,
    'committeePreference': COLUMNS.COMMITTEE_PREFERENCE,
    'membershipDues': COLUMNS.MEMBERSHIP_DUES,
    'sustainableAmount': COLUMNS.SUSTAINABLE_AMOUNT,
    'emergencyFullName': COLUMNS.EMERGENCY_FULL_NAME,
    'emergencyRelationship': COLUMNS.EMERGENCY_RELATIONSHIP,
    'emergencyPhone': COLUMNS.EMERGENCY_PHONE,
    'declaration': COLUMNS.DECLARATION,
    'verification': COLUMNS.VERIFICATION,
    'role': COLUMNS.ROLE
  };
  
  return fieldMap[fieldName] || 0;
}

// ============================================
// TRIGGER MANAGEMENT
// ============================================

/**
 * Setup form trigger (run once)
 */
function createFormTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();

  Logger.log("✅ Form submission trigger created successfully.");
}

/**
 * Check triggers
 */
function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  if (triggers.length === 0) {
    Logger.log("❌ No triggers found! Run createFormTrigger()");
    return;
  }
  
  Logger.log(`Found ${triggers.length} trigger(s):`);
  triggers.forEach((trigger, index) => {
    Logger.log(`Trigger #${index + 1}:`);
    Logger.log(`- Handler: ${trigger.getHandlerFunction()}`);
    Logger.log(`- Event: ${trigger.getEventType()}`);
    Logger.log(`- Source: ${trigger.getTriggerSource()}`);
  });
}

// ============================================
// WEB APP ENDPOINTS
// ============================================

/**
 * Handle GET requests
 */

function getMemberDues(params) {
  var memberId      = params.memberId || '';

  // ── Hardcoded config — no need to pass these in the request ──
  var sheet2025Name = '2025 DUE';
  var sheet2026Name = '2026 DUE';
  var sheet2027Name = '2027 DUE';
  var monthlyDue    = 1000;
  // ─────────────────────────────────────────────────────────────

  if (!memberId) return { found: false, memberId: '', error: 'Missing memberId' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  function getSheetData(sheetName) {
    try {
      var sheet = ss.getSheetByName(sheetName);
      return sheet ? sheet.getDataRange().getValues() : null;
    } catch (e) { return null; }
  }

  function findMember(data) {
    if (!data) return null;
    var headers = data[0];
    var memberIdCol = -1, nameCol = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toLowerCase().trim();
      if (h === 'member id') memberIdCol = c;
      if (h.includes('full name') || h === 'name') nameCol = c;
    }
    for (var r = 1; r < data.length; r++) {
      var rowId = String(data[r][memberIdCol] || '').trim().toUpperCase();
      if (rowId === memberId.toUpperCase()) {
        var months = {};
        for (var c2 = 0; c2 < headers.length; c2++) {
          var hdr = String(headers[c2]).trim();
          if (hdr && hdr !== 'Member ID' && !hdr.toLowerCase().includes('name')
              && hdr !== 'TOTAL' && hdr !== 'S/N') {
            var val = data[r][c2];
            months[hdr] = (val === '' || val === null || val === undefined) ? 0 : parseFloat(val) || 0;
          }
        }
        return { name: String(data[r][nameCol] || ''), dues: months };
      }
    }
    return null;
  }

  var found2025 = findMember(getSheetData(sheet2025Name));
  var found2026 = findMember(getSheetData(sheet2026Name));
  var found2027 = findMember(getSheetData(sheet2027Name));

  if (!found2025 && !found2026 && !found2027) {
    return { found: false, memberId: memberId };
  }

  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTHS_FULL  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

  var now          = new Date();
  var currentYear  = now.getFullYear();
  var currentMonth = now.getMonth(); // 0-indexed

  var dues2025 = found2025 ? found2025.dues : {};
  var dues2026 = found2026 ? found2026.dues : {};
  var dues2027 = found2027 ? found2027.dues : {};

  function getPaid(year, monthIdx) {
    var key = MONTHS_SHORT[monthIdx];
    if (year === 2025) return dues2025[key] || 0;
    if (year === 2026) return dues2026[key] || 0;
    if (year === 2027) return dues2027[key] || 0;
    return 0;
  }

  // Build full timeline Aug 2025 → Dec 2027
  var timeline = [];
  [2025, 2026, 2027].forEach(function(yr) {
    var startM = (yr === 2025) ? 7 : 0;
    for (var m = startM; m <= 11; m++) {
      timeline.push({ year: yr, monthIdx: m });
    }
  });

  // ── FIX 1: totalAmountPaid counts ALL paid months across the full timeline,
  //           not just up to current date — a member can pay ahead in advance.
  var totalPaid      = 0;
  var paidMonths     = [];
  var unpaidPastMonths = []; // only months up to current that are unpaid
  var firstPaidMonth = null;
  var lastPaidMonth  = null;

  timeline.forEach(function(entry) {
    var paid  = getPaid(entry.year, entry.monthIdx);
    var label = MONTHS_FULL[entry.monthIdx] + ' ' + entry.year;

    if (paid > 0) {
      totalPaid += paid;
      paidMonths.push(label);
      if (!firstPaidMonth) firstPaidMonth = label;
      lastPaidMonth = label; // keeps updating → ends up as the latest paid month
    } else {
      // Only flag as unpaid/outstanding if it's a past or current month
      var isPastOrCurrent = (entry.year < currentYear) ||
                            (entry.year === currentYear && entry.monthIdx <= currentMonth);
      if (isPastOrCurrent) {
        unpaidPastMonths.push(label);
      }
    }
  });

  // ── FIX 2: nextDueDate = first month in the timeline that has NO payment,
  //           regardless of whether it's in the future or not.
  //           This correctly returns Jan 2027 when paid through Dec 2026.
  var nextDueEntry = null;
  for (var i = 0; i < timeline.length; i++) {
    var entry = timeline[i];
    if (getPaid(entry.year, entry.monthIdx) === 0) {
      nextDueEntry = entry;
      break;
    }
  }

  // ── Assessed months = all months from Aug 2025 up to current month
  var totalAssessed = 0;
  timeline.forEach(function(entry) {
    var isPastOrCurrent = (entry.year < currentYear) ||
                          (entry.year === currentYear && entry.monthIdx <= currentMonth);
    if (isPastOrCurrent) totalAssessed++;
  });

  var outstanding = Math.max(0, (totalAssessed * monthlyDue) - totalPaid);

  var amountPaidRange = paidMonths.length > 0
    ? firstPaidMonth + ' → ' + lastPaidMonth
    : 'No payments recorded';

  var nextDueDate = nextDueEntry
    ? MONTHS_FULL[nextDueEntry.monthIdx] + ' ' + nextDueEntry.year
    : 'All paid up to Dec 2027';

  return {
    found:            true,
    memberId:         memberId,
    fullName:         (found2025 || found2026 || found2027).name,

    // Summary figures
    totalAmountPaid:  totalPaid,                  // sum of ALL payments including advance
    outstanding:      outstanding,                // only based on past/current months
    monthlyDue:       monthlyDue,
    totalAssessed:    totalAssessed,
    paidMonthCount:   paidMonths.length,
    unpaidMonthCount: unpaidPastMonths.length,

    // Payment range
    amountPaidRange:  amountPaidRange,            // "August 2025 → December 2026"
    firstPaidMonth:   firstPaidMonth,
    lastPaidMonth:    lastPaidMonth,              // "December 2026"

    // Next due
    nextDueDate:      nextDueDate,                // "January 2027"
    nextDueAmount:    monthlyDue,

    // Detail lists
    paidMonths:       paidMonths,
    unpaidMonths:     unpaidPastMonths,           // only overdue months

    // Raw dues per year
    dues2025:         dues2025,
    dues2026:         dues2026,
    dues2027:         dues2027
  };
}

function doGet(e) {
  const action = e.parameter.action;
  const identifier = e.parameter.identifier;
  const category = e.parameter.category;
  const query = e.parameter.query;

  let result;

  switch (action) {
    case 'getUser':
      if (identifier) {
        result = getUser(identifier);
      } else {
        result = { success: false, message: "Missing identifier" };
      }
      break;

    case 'getAllMembers':
      result = getAllMembers();
      break;

    case 'getMembersByCategory':
      result = getMembersByCategory(category || 'all');
      break;

    case 'searchMembers':
      result = searchMembers(query || '');
      break;

    case 'getStatistics':
      result = getIndustryStatistics();
      break;

    case 'getDues':
      result = getMemberDues(e.parameter);
      break;

    case 'getDuesStats':
      result = getDuesStats();
      break;

    default:
      result = { success: false, message: "Invalid action" };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch(action) {
      case 'addUser':
        result = addUser(data.userData);
        break;
      case 'editUser':
        result = editUser(data.identifier, data.updates);
        break;
      case 'deleteUser':
        result = deleteUser(data.identifier);
        break;

      case 'sendContactRequest':
        result = sendContactRequest(data.data);
        break;
      case 'verifyUser':
        result = verifyUser(data.identifier, data.verified);
        break;
       case 'registerLogin':
        result = registerLogin(data.email, data.password);
        break;
      case 'authenticateUser':
        result = authenticateUser(data.email, data.password);
        break;
      case 'changePassword':
        result = changePassword(data.email, data.oldPassword, data.newPassword);
        break;
      case 'checkLoginStatus':
        result = checkLoginStatus(data.email);
        break;
      case 'sendOTP':
        result = sendOTP(data.email);
        break;
      case 'setupPasswordWithOTP':
        result = setupPasswordWithOTP(data.email, data.otp, data.newPassword);
        break;
      case 'sendNotification':
        result = sendNotification(data.recipientIds, data.subject, data.message);
        break;
      case 'updateMemberDues':
        result = updateMemberDues(data.memberId, data.duesData);
        break;
      case 'changeRole':
        result = changeRole(data.identifier, data.role);
        break;
      default:
        result = { success: false, message: "Invalid action" };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    logError('doPost', error, { postData: e.postData.contents });
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: `Error processing request: ${error.toString()}`
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// AUTHENTICATION & VERIFICATION FUNCTIONS
// ============================================

function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function verifyUser(identifier, verified) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const userLocation = findUserOptimized(identifier);
    
    if (!userLocation.found) {
      return { success: false, message: "User not found" };
    }
    
    const sheet = getSheet();
    const rowNumber = userLocation.row;
    
    // Check current state
    const currentMemberId = sheet.getRange(rowNumber, COLUMNS.MEMBER_ID).getValue();
    
    if (verified) {
      let newMemberId = currentMemberId;
      // If they don't have a Member ID yet, generate one
      if (!currentMemberId || currentMemberId === "Pending") {
        newMemberId = generateSequentialMemberIdOptimized();
        sheet.getRange(rowNumber, COLUMNS.MEMBER_ID).setValue(newMemberId);
        
        // Also send welcome email
        const name = sheet.getRange(rowNumber, COLUMNS.FULL_NAME).getValue();
        const email = sheet.getRange(rowNumber, COLUMNS.EMAIL).getValue();
        sendWelcomeEmailAsync(email, name, newMemberId);
      }
      
      sheet.getRange(rowNumber, COLUMNS.VERIFICATION).setValue(true);
      clearUserCache();
      
      return {
        success: true,
        message: "User verified successfully",
        memberId: newMemberId
      };
    } else {
      // Revoke verification
      sheet.getRange(rowNumber, COLUMNS.VERIFICATION).setValue(false);
      clearUserCache();
      
      return {
        success: true,
        message: "User verification revoked"
      };
    }
  } catch (error) {
    return { success: false, message: `Error verifying user: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

function getLoginSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.LOGIN_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.LOGIN_SHEET_NAME);
    sheet.appendRow(["user email", "hashed password", "resetpasstoken", "expire date"]);
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
  }
  return sheet;
}

function findLoginRow(email, sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < emails.length; i++) {
    if (emails[i][0].toLowerCase() === email.toLowerCase()) {
      return i + 2;
    }
  }
  return -1;
}

function registerLogin(email, plainPassword) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getLoginSheet();
    const existingRow = findLoginRow(email, sheet);
    
    if (existingRow !== -1) {
      return { success: false, message: "Login already registered for this email" };
    }
    
    const hashedPassword = hashPassword(plainPassword);
    sheet.appendRow([email.toLowerCase(), hashedPassword, "", ""]);
    
    return { success: true, message: "Login registered successfully" };
  } catch (error) {
    return { success: false, message: `Error registering login: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

function authenticateUser(email, plainPassword) {
  const sheet = getLoginSheet();
  const row = findLoginRow(email, sheet);
  
  if (row === -1) {
    return { success: false, message: "User not found" };
  }
  
  const storedHash = sheet.getRange(row, 2).getValue();
  const inputHash = hashPassword(plainPassword);
  
  if (storedHash === inputHash) {
    return { success: true, message: "Authenticated successfully" };
  } else {
    return { success: false, message: "Invalid password" };
  }
}

function changePassword(email, oldPassword, newPassword) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getLoginSheet();
    const row = findLoginRow(email, sheet);
    
    if (row === -1) {
      return { success: false, message: "User not found" };
    }
    
    const storedHash = sheet.getRange(row, 2).getValue();
    const oldInputHash = hashPassword(oldPassword);
    
    if (storedHash !== oldInputHash) {
      return { success: false, message: "Incorrect old password" };
    }
    
    const newHash = hashPassword(newPassword);
    sheet.getRange(row, 2).setValue(newHash);
    
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    return { success: false, message: `Error changing password: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

function checkLoginStatus(email) {
  const userLocation = findUserOptimized(email);
  if (!userLocation.found) {
    return { success: false, exists: false, loginSetup: false, message: "Email is not registered in the alumni directory." };
  }
  
  const loginSheet = getLoginSheet();
  const loginRow = findLoginRow(email, loginSheet);
  
  if (loginRow === -1) {
    return { success: true, exists: true, loginSetup: false, message: "Login has not been set up for this user." };
  }
  
  const storedHash = loginSheet.getRange(loginRow, 2).getValue();
  if (!storedHash) {
    return { success: true, exists: true, loginSetup: false, message: "Login has not been set up for this user." };
  }
  
  return { success: true, exists: true, loginSetup: true, message: "Login is set up." };
}

function sendOTP(email) {
  const userLocation = findUserOptimized(email);
  if (!userLocation.found) {
    return { success: false, message: "Email is not registered in the alumni directory." };
  }
  
  const name = userLocation.found ? getSheet().getRange(userLocation.row, COLUMNS.FULL_NAME).getValue() : "Alumni Member";
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
  
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getLoginSheet();
    const row = findLoginRow(email, sheet);
    
    if (row === -1) {
      // Append a new row with no password yet, but with OTP
      sheet.appendRow([email.toLowerCase(), "", otp, expireTime]);
    } else {
      // Update OTP and expire date
      sheet.getRange(row, 3).setValue(otp);
      sheet.getRange(row, 4).setValue(expireTime);
    }
    
    // Send email with OTP
    const subject = "CSSI Alumni Portal - Your One-Time Password (OTP)";
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #0a1628, #1e3a8a); padding: 2rem; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">CSSI Alumni Portal</h2>
            </div>
            <div style="padding: 2.5rem; background: #ffffff;">
              <p style="font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.5;">You requested to set up or reset your password on the CSSI Alumni Portal. Use the One-Time Password (OTP) below to proceed:</p>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 2rem 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #6b7280;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
            </div>
            <div style="background: #f9fafb; padding: 1.5rem; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CSSI 05/11 Alumni Association</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    GmailApp.sendEmail(email, subject, `Your OTP is: ${otp}. Valid for 10 minutes.`, {
      htmlBody: htmlBody,
      name: "CSSI Alumni Portal"
    });
    
    return { success: true, message: "OTP sent successfully to your email." };
  } catch (error) {
    return { success: false, message: `Error sending OTP: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

function setupPasswordWithOTP(email, otp, newPassword) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getLoginSheet();
    const row = findLoginRow(email, sheet);
    
    if (row === -1) {
      return { success: false, message: "No active session found for this email." };
    }
    
    const storedOtp = sheet.getRange(row, 3).getValue();
    const expireTimeStr = sheet.getRange(row, 4).getValue();
    
    if (!storedOtp || String(storedOtp).trim() !== String(otp).trim()) {
      return { success: false, message: "Invalid OTP code." };
    }
    
    if (expireTimeStr) {
      const expireTime = new Date(expireTimeStr);
      if (new Date() > expireTime) {
        return { success: false, message: "OTP code has expired. Please request a new one." };
      }
    }
    
    // OTP is valid!
    const newHash = hashPassword(newPassword);
    sheet.getRange(row, 2).setValue(newHash); // Update password
    sheet.getRange(row, 3).setValue("");      // Clear OTP
    sheet.getRange(row, 4).setValue("");      // Clear Expire Time
    
    return { success: true, message: "Password set successfully. You can now log in." };
  } catch (error) {
    return { success: false, message: `Error setting password: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// NOTIFICATION & DUES & ROLE MANAGEMENT
// ============================================

/**
 * Send email notification to one or more members by Member ID
 */
function sendNotification(recipientIds, subject, message) {
  if (!recipientIds || recipientIds.length === 0) {
    return { success: false, message: 'No recipients provided' };
  }
  if (!subject || !message) {
    return { success: false, message: 'Subject and message are required' };
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: 'No members found' };

  const data = sheet.getRange(2, 1, lastRow - 1, 27).getValues();

  // Build a map: memberId -> { email, name }
  const memberMap = {};
  data.forEach(row => {
    const id = String(row[24] || '').trim();
    if (id) {
      memberMap[id] = { email: row[1], name: row[2] };
    }
  });

  let sent = 0;
  const errors = [];

  recipientIds.forEach(id => {
    const member = memberMap[String(id).trim()];
    if (!member || !member.email) {
      errors.push(`Member not found: ${id}`);
      return;
    }
    try {
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a1628, #1e3a8a); color: white; padding: 2rem; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">${subject}</h2>
            <p style="margin: 0.5rem 0 0; opacity: 0.9;">CSSI 05/11 Alumni Association</p>
          </div>
          <div style="background: #f9fafb; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p>Dear <strong>${member.name}</strong>,</p>
            <div style="background: white; padding: 1.5rem; border-radius: 8px; line-height: 1.7;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 2rem; color: #6b7280; font-size: 0.9rem;">
              Best regards,<br><strong>CSSI 05/11 Alumni Association</strong>
            </p>
          </div>
        </div>`;

      GmailApp.sendEmail(member.email, subject, message, {
        htmlBody: htmlBody,
        name: 'CSSI 05/11 Alumni Association'
      });
      sent++;

      if (sent % 10 === 0) Utilities.sleep(1000);
    } catch (err) {
      errors.push(`Failed for ${member.email}: ${err.toString()}`);
    }
  });

  Logger.log(`Notification sent to ${sent} of ${recipientIds.length} recipients`);
  return {
    success: sent > 0,
    message: `Sent to ${sent} member(s).${errors.length ? ' Errors: ' + errors.join('; ') : ''}`,
    sent: sent,
    errors: errors
  };
}

/**
 * Update monthly dues for a member in the dues sheets
 * duesData: { year, month, amount }
 */
function updateMemberDues(memberId, duesData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    if (!memberId || !duesData) {
      return { success: false, message: 'Missing memberId or duesData' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const year = duesData.year;
    const month = duesData.month; // e.g. "Jan", "Feb"
    const amount = parseFloat(duesData.amount) || 0;

    const sheetName = `${year} DUE`;
    const dueSheet = ss.getSheetByName(sheetName);
    if (!dueSheet) {
      return { success: false, message: `Sheet "${sheetName}" not found` };
    }

    const sheetData = dueSheet.getDataRange().getValues();
    const headers = sheetData[0];

    // Find the member row
    let memberIdCol = -1;
    let monthCol = -1;
    for (let c = 0; c < headers.length; c++) {
      const h = String(headers[c]).trim();
      if (h.toLowerCase() === 'member id') memberIdCol = c;
      if (h === month) monthCol = c;
    }

    if (memberIdCol === -1) return { success: false, message: 'Member ID column not found in sheet' };
    if (monthCol === -1) return { success: false, message: `Month column "${month}" not found in sheet` };

    for (let r = 1; r < sheetData.length; r++) {
      if (String(sheetData[r][memberIdCol]).trim().toUpperCase() === memberId.toUpperCase()) {
        dueSheet.getRange(r + 1, monthCol + 1).setValue(amount);
        return {
          success: true,
          message: `Updated ${month} ${year} dues for ${memberId} to ₦${amount}`
        };
      }
    }

    return { success: false, message: `Member ID "${memberId}" not found in ${sheetName}` };
  } catch (error) {
    return { success: false, message: `Error updating dues: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Change the role of a member (admin, finance, welfare, user)
 */
function changeRole(identifier, role) {
  const lock = LockService.getScriptLock();
  const allowed = ['admin', 'user', 'finance', 'welfare'];
  try {
    lock.waitLock(15000);
    if (!role || !allowed.includes(role)) {
      return { success: false, message: `Invalid role. Allowed: ${allowed.join(', ')}` };
    }
    const userLocation = findUserOptimized(identifier);
    if (!userLocation.found) {
      return { success: false, message: 'User not found' };
    }
    const sheet = getSheet();
    sheet.getRange(userLocation.row, COLUMNS.ROLE).setValue(role);
    clearUserCache();
    return { success: true, message: `Role updated to "${role}"` };
  } catch (error) {
    return { success: false, message: `Error changing role: ${error.toString()}` };
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// TESTING FUNCTIONS
// ============================================

function testAddUser() {
  const testUser = {
    email: "test@example.com",
    fullName: "Test User",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    phoneNumber: "08012345678",
    yearOfGraduation: "2011",
    city: "Lagos",
    country: "Nigeria"
  };
  
  const result = addUser(testUser);
  Logger.log(JSON.stringify(result, null, 2));
}

function testGetUser() {
  const result = getUser("test@example.com");
  Logger.log(JSON.stringify(result, null, 2));
}

function manualTest() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  const email = sheet.getRange("B" + lastRow).getValue();
  const name = sheet.getRange("C" + lastRow).getValue();
  const memberId = generateSequentialMemberIdOptimized();
  
  sheet.getRange(lastRow, 25).setValue(memberId);
  sendWelcomeEmailAsync(email, name, memberId);
  
  Logger.log(`✅ Manual test completed for row ${lastRow}`);
  Logger.log(`📧 Email: ${email}`);
  Logger.log(`👤 Name: ${name}`);
  Logger.log(`🆔 Member ID: ${memberId}`);
}



// ============================================
// ALUMNI DIRECTORY - BACKEND FUNCTIONS
// ============================================

/**
 * Get all members with public profile information
 * @returns {Object} Members list
 */
function getAllMembers() {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return {
        success: true,
        members: [],
        count: 0
      };
    }

    // Get all data at once (more efficient)
    const data = sheet.getRange(2, 1, lastRow - 1, 27).getValues();
    
    // Filter and format members with relevant information
    const members = data
      .filter(row => row[1]) // Has email
      .map(row => ({
        timestamp: row[0],
        email: row[1],
        fullName: row[2] || 'N/A',
        dateOfBirth: row[3] || '',
        gender: row[4] || '',
        phoneNumber: row[5] || '',
        yearOfGraduation: row[6] || 'N/A',
        house: row[7] || '',
        class: row[8] || '',
        city: row[9] || 'N/A',
        stateProvince: row[10] || '',
        country: row[11] || '',
        currentOccupation: row[12] || 'N/A',
        industryField: row[13] || 'N/A',
        companyOrganization: row[14] || 'N/A',
        linkedinProfile: row[15] || '',
        activelyInvolved: row[16] || '',
        committeePreference: row[17] || '',
        membershipDues: row[18] || '',
        sustainableAmount: row[19] || '',
        emergencyFullName: row[20] || '',
        emergencyRelationship: row[21] || '',
        emergencyPhone: row[22] || '',
        declaration: row[23] || '',
        memberId: row[24] || 'N/A',
        verification: row[25] === true || row[25] === 'true' || row[25] === 'TRUE',
        role: row[26] || 'user'
      }));

    return {
      success: true,
      members: members,
      count: members.length
    };

  } catch (error) {
    Logger.log('Error in getAllMembers: ' + error.toString());
    return {
      success: false,
      message: 'Error fetching members: ' + error.toString(),
      members: []
    };
  }
}

/**
 * Get members by industry/field category
 * @param {string} category - Industry category
 * @returns {Object} Filtered members
 */
function getMembersByCategory(category) {
  try {
    const allMembersResult = getAllMembers();
    
    if (!allMembersResult.success) {
      return allMembersResult;
    }

    const categoryKeywords = getCategoryKeywords(category);
    
    if (category === 'all' || !categoryKeywords) {
      return allMembersResult;
    }

    const filteredMembers = allMembersResult.members.filter(member => {
      const searchText = `${member.industryField} ${member.currentOccupation} ${member.companyOrganization}`.toLowerCase();
      
      return categoryKeywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    });

    return {
      success: true,
      members: filteredMembers,
      count: filteredMembers.length,
      category: category
    };

  } catch (error) {
    Logger.log('Error in getMembersByCategory: ' + error.toString());
    return {
      success: false,
      message: 'Error filtering members: ' + error.toString(),
      members: []
    };
  }
}

/**
 * Search members by query
 * @param {string} query - Search query
 * @returns {Object} Search results
 */
function searchMembers(query) {
  try {
    const allMembersResult = getAllMembers();
    
    if (!allMembersResult.success) {
      return allMembersResult;
    }

    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return allMembersResult;
    }

    const filteredMembers = allMembersResult.members.filter(member => {
      return (
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.currentOccupation.toLowerCase().includes(searchTerm) ||
        member.companyOrganization.toLowerCase().includes(searchTerm) ||
        member.industryField.toLowerCase().includes(searchTerm) ||
        member.city.toLowerCase().includes(searchTerm)
      );
    });

    return {
      success: true,
      members: filteredMembers,
      count: filteredMembers.length,
      query: query
    };

  } catch (error) {
    Logger.log('Error in searchMembers: ' + error.toString());
    return {
      success: false,
      message: 'Error searching members: ' + error.toString(),
      members: []
    };
  }
}

/**
 * Send contact request between members
 * @param {Object} contactData - Contact request data
 * @returns {Object} Result
 */
function sendContactRequest(contactData) {
  try {
    const {
      recipientName,
      recipientEmail,
      senderName,
      senderEmail,
      senderPhone,
      message
    } = contactData;

    // Validate required fields
    if (!recipientEmail || !senderName || !senderEmail || !message) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }

    // Send email to recipient
    const subject = `CSSI Alumni Connection Request from ${senderName}`;
    
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0a1628, #1e3a8a); color: white; padding: 2rem; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 1.75rem;">Alumni Connection Request</h2>
            <p style="margin: 0.5rem 0 0; opacity: 0.95;">CSSI 05/11 Alumni Association</p>
          </div>

          <div style="background: #f9fafb; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p style="font-size: 1.1rem; margin-top: 0;">Dear <strong>${recipientName}</strong>,</p>
            
            <p>A fellow CSSI alumni member would like to connect with you:</p>

            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #1e3a8a;">
              <p style="margin: 0 0 0.5rem;"><strong>Name:</strong> ${senderName}</p>
              <p style="margin: 0 0 0.5rem;"><strong>Email:</strong> ${senderEmail}</p>
              ${senderPhone ? `<p style="margin: 0 0 0.5rem;"><strong>Phone:</strong> ${senderPhone}</p>` : ''}
            </div>

            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
              <p style="margin: 0 0 0.5rem; color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">Message:</p>
              <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>

            <p>You can reply directly to <strong>${senderEmail}</strong> to continue the conversation.</p>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
                This is an automated message from the CSSI 05/11 Alumni Directory. 
                If you have any questions, please contact <a href="mailto:cssi0511official@gmail.com" style="color: #1e3a8a;">cssi0511official@gmail.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const plainBody = `
Dear ${recipientName},

A fellow CSSI alumni member would like to connect with you:

Name: ${senderName}
Email: ${senderEmail}
${senderPhone ? `Phone: ${senderPhone}` : ''}

Message:
${message}

You can reply directly to ${senderEmail} to continue the conversation.

---
CSSI 05/11 Alumni Association
    `;

    GmailApp.sendEmail(recipientEmail, subject, plainBody, {
      htmlBody: htmlBody,
      name: 'CSSI Alumni Directory',
      replyTo: senderEmail
    });

    // Send confirmation to sender
    sendContactConfirmation(senderName, senderEmail, recipientName);

    // Log the contact request
    logContactRequest(contactData);

    Logger.log(`✅ Contact request sent from ${senderEmail} to ${recipientEmail}`);

    return {
      success: true,
      message: 'Contact request sent successfully'
    };

  } catch (error) {
    Logger.log('❌ Error in sendContactRequest: ' + error.toString());
    logError('sendContactRequest', error, contactData);
    return {
      success: false,
      message: 'Error sending contact request: ' + error.toString()
    };
  }
}

/**
 * Send confirmation email to the sender
 */
function sendContactConfirmation(senderName, senderEmail, recipientName) {
  try {
    const subject = 'Connection Request Sent - CSSI Alumni Directory';
    
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2rem; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 1.75rem;">✓ Message Sent Successfully</h2>
          </div>

          <div style="background: #f9fafb; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p style="font-size: 1.1rem; margin-top: 0;">Dear <strong>${senderName}</strong>,</p>
            
            <p>Your connection request has been successfully sent to <strong>${recipientName}</strong>.</p>

            <p>They will receive your message and contact details. You should hear back from them soon via email.</p>

            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 0.95rem;">
                <strong>💡 Tip:</strong> Keep an eye on your inbox (and spam folder) for their response!
              </p>
            </div>

            <p style="margin-top: 2rem;">
              Thank you for using the CSSI Alumni Directory to connect with fellow alumni.
            </p>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
                Best regards,<br>
                <strong>CSSI 05/11 Alumni Association</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    GmailApp.sendEmail(senderEmail, subject, `Your connection request was sent to ${recipientName}.`, {
      htmlBody: htmlBody,
      name: 'CSSI Alumni Directory'
    });

  } catch (error) {
    Logger.log('⚠️ Could not send confirmation email: ' + error.toString());
  }
}

/**
 * Log contact requests for tracking
 */
function logContactRequest(contactData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = spreadsheet.getSheetByName('Contact Requests');
    
    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('Contact Requests');
      logSheet.appendRow([
        'Timestamp',
        'Sender Name',
        'Sender Email',
        'Sender Phone',
        'Recipient Name',
        'Recipient Email',
        'Message',
        'Status'
      ]);
      
      // Format header row
      const headerRange = logSheet.getRange(1, 1, 1, 8);
      headerRange.setBackground('#1e3a8a');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }

    // Log the request
    logSheet.appendRow([
      new Date(),
      contactData.senderName,
      contactData.senderEmail,
      contactData.senderPhone || 'N/A',
      contactData.recipientName,
      contactData.recipientEmail,
      contactData.message,
      'Sent'
    ]);

  } catch (error) {
    Logger.log('⚠️ Could not log contact request: ' + error.toString());
  }
}

/**
 * Get category keywords for filtering
 */
function getCategoryKeywords(category) {
  const categories = {
    'technology': ['technology', 'tech', 'it', 'software', 'developer', 'engineer', 'programming', 'data', 'ai', 'cyber'],
    'finance': ['finance', 'banking', 'accounting', 'investment', 'financial', 'economics'],
    'healthcare': ['healthcare', 'medical', 'health', 'doctor', 'nurse', 'pharmacy', 'medicine'],
    'education': ['education', 'teaching', 'academic', 'professor', 'teacher', 'training', 'learning'],
    'engineering': ['engineering', 'civil', 'mechanical', 'electrical', 'structural', 'construction'],
    'legal': ['legal', 'law', 'lawyer', 'attorney', 'barrister', 'solicitor'],
    'business': ['business', 'management', 'consulting', 'entrepreneur', 'executive', 'ceo', 'director'],
    'marketing': ['marketing', 'advertising', 'brand', 'digital marketing', 'sales', 'communications'],
    'creative': ['design', 'creative', 'art', 'media', 'content', 'graphics', 'photography', 'video'],
    'oil-gas': ['oil', 'gas', 'petroleum', 'energy', 'upstream', 'downstream'],
    'agriculture': ['agriculture', 'farming', 'agro', 'agribusiness'],
    'hospitality': ['hospitality', 'hotel', 'tourism', 'restaurant', 'catering'],
    'real-estate': ['real estate', 'property', 'realtor', 'housing', 'estate'],
    'ngo': ['ngo', 'non-profit', 'nonprofit', 'charity', 'foundation', 'humanitarian']
  };

  return categories[category] || null;
}

/**
 * Get industry statistics
 * @returns {Object} Statistics by industry
 */
function getIndustryStatistics() {
  try {
    const allMembersResult = getAllMembers();
    
    if (!allMembersResult.success) {
      return allMembersResult;
    }

    const stats = {
      total: allMembersResult.count,
      byCategory: {},
      byCity: {},
      byGradYear: {}
    };

    const categories = [
      'technology', 'finance', 'healthcare', 'education', 'engineering',
      'legal', 'business', 'marketing', 'creative', 'oil-gas',
      'agriculture', 'hospitality', 'real-estate', 'ngo'
    ];

    // Initialize category counts
    categories.forEach(cat => {
      stats.byCategory[cat] = 0;
    });

    // Count members in each category
    allMembersResult.members.forEach(member => {
      const searchText = `${member.industryField} ${member.currentOccupation} ${member.companyOrganization}`.toLowerCase();
      
      categories.forEach(category => {
        const keywords = getCategoryKeywords(category);
        if (keywords && keywords.some(kw => searchText.includes(kw.toLowerCase()))) {
          stats.byCategory[category]++;
        }
      });

      // Count by city
      if (member.city) {
        stats.byCity[member.city] = (stats.byCity[member.city] || 0) + 1;
      }

      // Count by graduation year
      if (member.yearOfGraduation) {
        stats.byGradYear[member.yearOfGraduation] = (stats.byGradYear[member.yearOfGraduation] || 0) + 1;
      }
    });

    return {
      success: true,
      statistics: stats
    };

  } catch (error) {
    Logger.log('Error in getIndustryStatistics: ' + error.toString());
    return {
      success: false,
      message: 'Error getting statistics: ' + error.toString()
    };
  }
}

/**
 * Calculates aggregate dues statistics (Total Paid and Total Outstanding).
 * It scans all members in the main sheet and checks their dues history in 2025, 2026, 2027.
 */
function getDuesStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet2025 = ss.getSheetByName('2025 DUE');
  const sheet2026 = ss.getSheetByName('2026 DUE');
  const sheet2027 = ss.getSheetByName('2027 DUE');
  
  const data2025 = sheet2025 ? sheet2025.getDataRange().getValues() : [];
  const data2026 = sheet2026 ? sheet2026.getDataRange().getValues() : [];
  const data2027 = sheet2027 ? sheet2027.getDataRange().getValues() : [];
  
  let totalPaid = 0;
  let totalOutstanding = 0;
  
  const monthlyDue = 1000;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (Jan = 0, Aug = 7)
  
  // Calculate total months assessed from Aug 2025 to current month
  let totalMonthsAssessed = 0;
  [2025, 2026, 2027].forEach(yr => {
    const startM = (yr === 2025) ? 7 : 0; // Starts in August for 2025
    for (let m = startM; m <= 11; m++) {
      const isPastOrCurrent = (yr < currentYear) || (yr === currentYear && m <= currentMonth);
      if (isPastOrCurrent) {
        totalMonthsAssessed++;
      }
    }
  });
  
  // Build a map of memberId -> totalPaid
  const memberPaidMap = {};
  
  function processSheet(data) {
    if (!data || data.length <= 1) return;
    const headers = data[0];
    let memberIdCol = -1;
    for (let c = 0; c < headers.length; c++) {
      if (String(headers[c]).toLowerCase().trim() === 'member id') {
        memberIdCol = c;
        break;
      }
    }
    if (memberIdCol === -1) return;
    
    for (let r = 1; r < data.length; r++) {
      const memberId = String(data[r][memberIdCol] || '').trim().toUpperCase();
      if (!memberId || memberId === 'PENDING') continue;
      
      let rowPaid = 0;
      for (let c = 0; c < headers.length; c++) {
        const hdr = String(headers[c]).trim();
        if (hdr && hdr !== 'Member ID' && !hdr.toLowerCase().includes('name') && hdr !== 'TOTAL' && hdr !== 'S/N') {
          const val = data[r][c];
          rowPaid += (val === '' || val === null || val === undefined) ? 0 : parseFloat(val) || 0;
        }
      }
      
      memberPaidMap[memberId] = (memberPaidMap[memberId] || 0) + rowPaid;
    }
  }
  
  processSheet(data2025);
  processSheet(data2026);
  processSheet(data2027);
  
  // Now sum up for active dues-paying members
  const mainSheet = getSheet();
  if (mainSheet) {
    const mainData = mainSheet.getDataRange().getValues();
    if (mainData.length > 1) {
      let mainMemberIdCol = -1;
      let mainDuesCol = -1;
      const mainHeaders = mainData[0];
      for (let c = 0; c < mainHeaders.length; c++) {
        const h = String(mainHeaders[c]).toLowerCase().trim();
        if (h === 'member id') mainMemberIdCol = c;
        if (h === 'membership dues') mainDuesCol = c;
      }
      
      if (mainMemberIdCol !== -1 && mainDuesCol !== -1) {
        for (let r = 1; r < mainData.length; r++) {
          const memberId = String(mainData[r][mainMemberIdCol] || '').trim().toUpperCase();
          const paysDues = String(mainData[r][mainDuesCol] || '').trim().toLowerCase() === 'yes';
          
          if (!memberId || memberId === 'PENDING') continue;
          
          const paid = memberPaidMap[memberId] || 0;
          totalPaid += paid;
          
          if (paysDues) {
            const outstanding = Math.max(0, (totalMonthsAssessed * monthlyDue) - paid);
            totalOutstanding += outstanding;
          }
        }
      }
    }
  }
  
  return {
    success: true,
    totalPaid: totalPaid,
    totalOutstanding: totalOutstanding
  };
}
