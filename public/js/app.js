// Global variables
let customers = [];
let currentEditingId = null;
let deleteCustomerId = null;
let charts = {
    registration: null,
    frequentGuests: null,
    age: null,
    birthday: null,
    city: null
};

// Pagination variables
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

// Authentication variables
let currentUser = null;
let isLoggedIn = false;

// Authentication functions
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

function createDefaultUser() {
    const users = getUsers();
    if (!users.find(user => user.username === 'admin')) {
        users.push({
            id: generateId(),
            username: 'admin',
            password: simpleHash('admin123'),
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('hotelUsers', JSON.stringify(users));
    }

    // Ensure all existing users have roles
    users.forEach(user => {
        if (!user.role) {
            user.role = 'user';
        }
    });
    localStorage.setItem('hotelUsers', JSON.stringify(users));
}

function getUsers() {
    const users = localStorage.getItem('hotelUsers');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('hotelUsers', JSON.stringify(users));
}

function authenticateUser(username, password) {
    const users = getUsers();
    const hashedPassword = simpleHash(password);
    const user = users.find(u => u.username === username && u.password === hashedPassword);
    return user || null;
}

function login(username, password) {
    const user = authenticateUser(username, password);
    if (user) {
        currentUser = user;
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTime', Date.now().toString());
        showApp();
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    showLogin();
}

function checkAuthentication() {
    // Create default user if not exists
    createDefaultUser();

    const savedUser = localStorage.getItem('currentUser');
    const loginTime = localStorage.getItem('loginTime');

    console.log('checkAuthentication - Saved user:', savedUser); // Debug log
    console.log('checkAuthentication - Login time:', loginTime); // Debug log

    if (savedUser && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        console.log('checkAuthentication - Hours since login:', hoursDiff); // Debug log

        // Auto logout after 24 hours
        if (hoursDiff < 24) {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            console.log('checkAuthentication - Auto logged in as:', currentUser); // Debug log
            showApp();
            return;
        } else {
            console.log('checkAuthentication - Session expired, logging out'); // Debug log
            logout();
            return;
        }
    }

    console.log('checkAuthentication - No saved session, showing login'); // Debug log
    showLogin();
}

function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.querySelector('.app').style.display = 'none';
}

function showApp() {
    if (!currentUser) {
        console.log('showApp called but no currentUser, redirecting to login');
        showLogin();
        return;
    }

    console.log('showApp - Showing app for user:', currentUser.username, 'Role:', currentUser.role);

    // TEMPORARY: Force non-admin role for testing restrictions
    // Uncomment the line below to test non-admin restrictions
    // currentUser.role = 'user';
    // console.log('FORCED NON-ADMIN ROLE FOR TESTING');

    document.getElementById('login-page').style.display = 'none';
    document.querySelector('.app').style.display = 'block';

    // Apply role-based restrictions
    restrictFeatures();

    // Initialize app data
    loadCustomers();
    updateDashboard();
    updateCustomerTable();
    updateBirthdays();
    initializeCharts();
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (login(username, password)) {
        showNotification('Login berhasil!', 'success');
    } else {
        showNotification('Username atau password salah!', 'error');
    }
}

// Sample data and OCR data
const sampleCustomers = [
    {
        "id": 1,
        "nama": "Budi Santoso",
        "email": "budi.santoso@email.com",
        "alamat": "Jl. Sudirman No. 123",
        "kota": "Jakarta Pusat",
        "noHp": "081234567890",
        "tanggalLahir": "15/03/1985",
        "jumlahMenginap": 15,
        "dateCreated": "15/01/2024",
        "kamar": "101",
        "pekerjaan": "Pegawai Swasta",
        "idType": "KTP",
        "idNumber": "3171234567890001",
        "checkinDate": "15/01/2024",
        "checkoutDate": "17/01/2024",
        "checkinTime": "14:00",
        "checkoutTime": "12:00",
        "isReturningGuest": true
    },
    {
        "id": 2,
        "nama": "Siti Nurhaliza",
        "email": "siti.nur@gmail.com",
        "alamat": "Jl. Gatot Subroto 45",
        "kota": "Bandung",
        "noHp": "081987654321",
        "tanggalLahir": "22/07/1990",
        "jumlahMenginap": 8,
        "dateCreated": "20/02/2024",
        "kamar": "205",
        "pekerjaan": "Guru",
        "idType": "KTP",
        "idNumber": "3272345678900002",
        "checkinDate": "20/02/2024",
        "checkoutDate": "22/02/2024",
        "checkinTime": "15:30",
        "checkoutTime": "11:00",
        "isReturningGuest": true
    },
    {
        "id": 3,
        "nama": "Ahmad Rahman",
        "email": "ahmad.rahman@yahoo.com",
        "alamat": "Jl. Ahmad Yani 67",
        "kota": "Surabaya",
        "noHp": "081876543210",
        "tanggalLahir": "10/12/1988",
        "jumlahMenginap": 22,
        "dateCreated": "05/11/2023",
        "kamar": "Suite 301",
        "pekerjaan": "Wiraswasta",
        "idType": "SIM",
        "idNumber": "3573456789010003",
        "checkinDate": "05/11/2023",
        "checkoutDate": "07/11/2023",
        "checkinTime": "16:00",
        "checkoutTime": "10:00",
        "isReturningGuest": true
    },
    {
        "id": 4,
        "nama": "Maya Indah",
        "email": "maya.indah@hotmail.com",
        "alamat": "Jl. Malioboro 89",
        "kota": "Yogyakarta",
        "noHp": "081765432109",
        "tanggalLahir": "05/10/1992",
        "jumlahMenginap": 3,
        "dateCreated": "12/08/2024",
        "kamar": "102",
        "pekerjaan": "Mahasiswa",
        "idType": "KTP",
        "idNumber": "3474567890120004",
        "checkinDate": "12/08/2024",
        "checkoutDate": "14/08/2024",
        "checkinTime": "13:00",
        "checkoutTime": "12:00",
        "isReturningGuest": false
    },
    {
        "id": 5,
        "nama": "Dedi Kurniawan",
        "email": "dedi.k@gmail.com",
        "alamat": "Jl. Asia Afrika 12",
        "kota": "Bandung",
        "noHp": "081654321098",
        "tanggalLahir": "08/10/1995",
        "jumlahMenginap": 11,
        "dateCreated": "18/03/2024",
        "kamar": "203",
        "pekerjaan": "Programmer",
        "idType": "Passport",
        "idNumber": "A1234567",
        "checkinDate": "18/03/2024",
        "checkoutDate": "20/03/2024",
        "checkinTime": "14:30",
        "checkoutTime": "11:30",
        "isReturningGuest": true
    }
];

// Enhanced OCR data generation
const indonesianNames = {
    firstNames: [
        "AHMAD", "MUHAMMAD", "ALI", "HADI", "SITI", "NUR", "DEWI", "AYU", "PUTRI", "RATNA",
        "BUDI", "SANTOSO", "HARTONO", "PRASETYO", "KURNIAWAN", "SETIAWAN", "SUSANTO", "WIJAYA",
        "SARI", "LINA", "MAYA", "INDIRA", "WULANDARI", "NOVITASARI", "PURWANINGSIH", "HIDAYAT",
        "FIRMAN", "ARDI", "YUSUF", "ABDULLAH", "FATIMAH", "KHADIJAH", "AISYAH", "ZAHRA", "NADIA"
    ],
    lastNames: [
        "HARTONO", "PRASETYO", "KURNIAWAN", "SETIAWAN", "SUSANTO", "WIJAYA", "SANTOSO",
        "HIDAYAT", "FIRMAN", "ABDULLAH", "NURCAHYO", "BUDIMAN", "SURYONO", "WIBOWO",
        "SARI", "DEWI", "WULANDARI", "PURWANINGSIH", "NURHALIZA", "SURYANI"
    ]
};

const streetNames = [
    "JL. SUDIRMAN", "JL. THAMRIN", "JL. GATOT SUBROTO", "JL. AHMAD YANI", "JL. DIPONEGORO",
    "JL. PEMUDA", "JL. VETERAN", "JL. KEBON JERUK", "JL. CENDANA RAYA", "JL. MAWAR INDAH",
    "JL. MELATI", "JL. ANGGREK", "JL. BUNGUR", "JL. KENANGA", "JL. TERNATE", "JL. MANGGA",
    "JL. APEL", "JL. JERUK", "JL. PISANG", "JL. DURIAN"
];

const indonesianLocations = {
    jakarta: {
        cities: ["JAKARTA PUSAT", "JAKARTA UTARA", "JAKARTA BARAT", "JAKARTA SELATAN", "JAKARTA TIMUR"],
        areaCodes: ["3171", "3172", "3173", "3174", "3175"], // Jakarta area codes
        kelurahan: ["GAMBIR", "TANAH ABANG", "MENTENG", "SENEN", "CEMPAKA PUTIH", "JOHAR BARU", "KEMAYORAN", "SAWAH BESAR", "PASAR BARU", "KARANG ANYAR"]
    },
    westJava: {
        cities: ["BANDUNG", "BOGOR", "DEPOK", "BEKASI", "TANGERANG"],
        areaCodes: ["3201", "3202", "3216", "3211", "3603"],
        kelurahan: ["CIKAMPEK", "KARAWANG", "PURWAKARTA", "SUBANG", "INDRAMAYU"]
    },
    eastJava: {
        cities: ["SURABAYA", "MALANG", "SIDOARJO", "GRESIK", "LAMONGAN"],
        areaCodes: ["3571", "3507", "3515", "3525", "3524"],
        kelurahan: ["JEMBER", "BANYUWANGI", "SITUBONDO", "BONDOWOSO", "SUMENEP"]
    },
    centralJava: {
        cities: ["SEMARANG", "SOLO", "PEKALONGAN", "TEGAL", "MAGELANG"],
        areaCodes: ["3324", "3311", "3326", "3328", "3308"],
        kelurahan: ["KUDUS", "JEPARA", "PATI", "REMBANG", "BLORA"]
    }
};

const cities = [
    ...indonesianLocations.jakarta.cities,
    ...indonesianLocations.westJava.cities,
    ...indonesianLocations.eastJava.cities,
    ...indonesianLocations.centralJava.cities,
    "YOGYAKARTA", "MEDAN", "PALEMBANG", "MAKASSAR", "DENPASAR"
];

function generateRandomKTPData() {
    // Generate realistic Indonesian name
    const firstName = indonesianNames.firstNames[Math.floor(Math.random() * indonesianNames.firstNames.length)];
    const lastName = indonesianNames.lastNames[Math.floor(Math.random() * indonesianNames.lastNames.length)];
    const fullName = Math.random() > 0.5 ? `${firstName} ${lastName}` : firstName;

    // Select location data
    const regions = Object.values(indonesianLocations);
    const selectedRegion = regions[Math.floor(Math.random() * regions.length)];
    const city = selectedRegion.cities[Math.floor(Math.random() * selectedRegion.cities.length)];
    const areaCode = selectedRegion.areaCodes[Math.floor(Math.random() * selectedRegion.areaCodes.length)];

    // Generate NIK with proper format: AreaCode(6) + BirthDate(6) + Sequential(4)
    const today = new Date();
    const birthYear = today.getFullYear() - Math.floor(Math.random() * 47) - 18;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDateStr = String(birthYear).slice(-2) + String(birthMonth).padStart(2, '0') + String(birthDay).padStart(2, '0');
    const sequential = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const nik = areaCode + birthDateStr + sequential;

    // Generate complete KTP address format
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    const houseNumber = Math.floor(Math.random() * 200) + 1;
    const rt = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
    const rw = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
    const kelurahan = selectedRegion.kelurahan[Math.floor(Math.random() * selectedRegion.kelurahan.length)];
    const kecamatan = kelurahan; // Simplified - in real KTPs these would be different

    // Determine province based on region
    let province = 'DKI JAKARTA';
    if (selectedRegion === indonesianLocations.westJava) province = 'JAWA BARAT';
    else if (selectedRegion === indonesianLocations.eastJava) province = 'JAWA TIMUR';
    else if (selectedRegion === indonesianLocations.centralJava) province = 'JAWA TENGAH';

    const fullAddress = `${street} NO. ${houseNumber} RT.${rt}/RW.${rw}\nKEL. ${kelurahan}\nKEC. ${kecamatan}\n${city}\n${province}`;

    // Generate birth date
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    // Generate gender
    const gender = Math.random() > 0.5 ? 'LAKI-LAKI' : 'PEREMPUAN';

    // Generate religion (Islam is most common in Indonesia)
    const religions = ['ISLAM', 'ISLAM', 'ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU', 'BUDHA', 'KONGHUCU'];
    const religion = religions[Math.floor(Math.random() * religions.length)];

    // Generate marital status
    const maritalStatuses = ['BELUM KAWIN', 'BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'];
    const maritalStatus = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];

    // Generate occupation
    const occupations = ['PELAJAR/MAHASISWA', 'KARYAWAN SWASTA', 'KARYAWAN SWASTA', 'PNS', 'WIRASWASTA', 'PETANI', 'NELAYAN', 'PEDAGANG'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];

    return {
        nik: nik,
        nama: fullName,
        tempatTanggalLahir: `${city}, ${String(birthDay).padStart(2, '0')}-${String(birthMonth).padStart(2, '0')}-${birthYear}`,
        jenisKelamin: gender,
        alamat: fullAddress,
        agama: religion,
        statusPerkawinan: maritalStatus,
        pekerjaan: occupation,
        kewarganegaraan: 'WNI',
        berlakuHingga: 'SEUMUR HIDUP'
    };
}

function generateRandomSIMData() {
    // Generate SIM number (12 digits)
    const simNumber = String(Math.floor(Math.random() * 999999999999) + 100000000000);

    // Generate realistic Indonesian name
    const firstName = indonesianNames.firstNames[Math.floor(Math.random() * indonesianNames.firstNames.length)];
    const lastName = indonesianNames.lastNames[Math.floor(Math.random() * indonesianNames.lastNames.length)];
    const fullName = Math.random() > 0.5 ? `${firstName} ${lastName}` : firstName;

    // Generate birth date (18-65 years old)
    const today = new Date();
    const birthYear = today.getFullYear() - Math.floor(Math.random() * 47) - 18;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    // Generate address (simpler than KTP)
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    const houseNumber = Math.floor(Math.random() * 200) + 1;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const address = `${street} NO. ${houseNumber}, ${city}`;

    // Generate SIM type
    const simTypes = ['SIM A', 'SIM B1', 'SIM B2', 'SIM C', 'SIM D'];
    const simType = simTypes[Math.floor(Math.random() * simTypes.length)];

    // Generate expiry date (5 years from now)
    const expiryYear = today.getFullYear() + 5;
    const expiryDate = `${expiryYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return {
        nomorSIM: simNumber,
        nama: fullName,
        tempatTanggalLahir: `${city}, ${birthDate.split('-').reverse().join('-')}`,
        alamat: address,
        jenisSIM: simType,
        berlakuHingga: expiryDate
    };
}

function simulateOCRErrors(text, errorRate = 0.05) {
    // Simulate more realistic OCR recognition errors
    let result = '';
    const chars = text.split('');

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];

        if (Math.random() < errorRate) {
            // Introduce realistic OCR errors
            const errorType = Math.random();

            if (errorType < 0.25) {
                // Character substitution (most common)
                const substitutions = {
                    'A': ['4', 'Δ'], 'B': ['8', '6'], 'C': ['0', 'O'], 'D': ['0', 'O'],
                    'E': ['3', '€'], 'F': ['7', 'Γ'], 'G': ['6', '9'], 'H': ['4', '11'],
                    'I': ['1', 'l'], 'J': ['7', '9'], 'K': ['4', 'X'], 'L': ['1', '7'],
                    'M': ['4', 'W'], 'N': ['4', 'M'], 'O': ['0', 'Q'], 'P': ['9', '4'],
                    'Q': ['0', 'O'], 'R': ['2', 'K'], 'S': ['5', '8'], 'T': ['7', '1'],
                    'U': ['0', 'V'], 'V': ['U', 'W'], 'W': ['M', 'V'], 'X': ['4', 'K'],
                    'Y': ['4', '7'], 'Z': ['2', '7'],
                    '0': ['O', 'Q'], '1': ['I', 'L'], '2': ['Z', 'R'], '3': ['E', '8'],
                    '4': ['A', 'Y'], '5': ['S', '8'], '6': ['G', 'B'], '7': ['T', 'J'],
                    '8': ['B', 'S'], '9': ['G', 'P']
                };
                const possibleSubs = substitutions[char] || [char];
                result += possibleSubs[Math.floor(Math.random() * possibleSubs.length)];
            } else if (errorType < 0.45) {
                // Skip character (common in poor quality scans)
                continue;
            } else if (errorType < 0.65) {
                // Insert extra character
                result += char;
                const extras = [' ', '.', '-', '_'];
                result += extras[Math.floor(Math.random() * extras.length)];
            } else if (errorType < 0.85) {
                // Merge with next character (ligature effect)
                if (i < chars.length - 1) {
                    result += char + chars[i + 1];
                    i++; // Skip next character
                } else {
                    result += char;
                }
            } else {
                // Split character (rare)
                if (char.length > 1) {
                    result += char.split('').join(' ');
                } else {
                    result += char;
                }
            }
        } else {
            result += char;
        }
    }

    // Post-processing: clean up common OCR artifacts
    result = result
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/(\d)\s+(\d)/g, '$1$2') // Remove spaces between digits in numbers
        .replace(/RT\s*\.\s*/g, 'RT.') // Fix RT. formatting
        .replace(/RW\s*\.\s*/g, 'RW.') // Fix RW. formatting
        .replace(/NO\s*\.\s*/g, 'NO.') // Fix NO. formatting
        .trim();

    return result;
}

function extractKTPDataFromImage() {
    // Randomly choose between KTP and SIM (70% KTP, 30% SIM)
    const isKTP = Math.random() < 0.7;
    const baseData = isKTP ? generateRandomKTPData() : generateRandomSIMData();

    // Apply OCR errors with varying accuracy
    const accuracy = 0.85 + Math.random() * 0.1; // 85-95% accuracy
    const errorRate = 1 - accuracy;

    if (isKTP) {
        return {
            idType: 'KTP',
            nik: simulateOCRErrors(baseData.nik, errorRate * 0.3), // NIK has fewer errors
            nama: simulateOCRErrors(baseData.nama.toUpperCase(), errorRate),
            tempatTanggalLahir: simulateOCRErrors(baseData.tempatTanggalLahir.toUpperCase(), errorRate * 0.7),
            jenisKelamin: simulateOCRErrors(baseData.jenisKelamin, errorRate * 0.5),
            alamat: simulateOCRErrors(baseData.alamat.toUpperCase(), errorRate * 0.8), // Addresses have more errors
            agama: simulateOCRErrors(baseData.agama, errorRate * 0.4),
            statusPerkawinan: simulateOCRErrors(baseData.statusPerkawinan, errorRate * 0.6),
            pekerjaan: simulateOCRErrors(baseData.pekerjaan, errorRate * 0.5),
            kewarganegaraan: simulateOCRErrors(baseData.kewarganegaraan, errorRate * 0.3),
            berlakuHingga: simulateOCRErrors(baseData.berlakuHingga, errorRate * 0.4)
        };
    } else {
        return {
            idType: 'SIM',
            nomorSIM: simulateOCRErrors(baseData.nomorSIM, errorRate * 0.2), // SIM numbers have fewer errors
            nama: simulateOCRErrors(baseData.nama.toUpperCase(), errorRate),
            tempatTanggalLahir: simulateOCRErrors(baseData.tempatTanggalLahir.toUpperCase(), errorRate * 0.7),
            alamat: simulateOCRErrors(baseData.alamat.toUpperCase(), errorRate * 0.6),
            jenisSIM: simulateOCRErrors(baseData.jenisSIM, errorRate * 0.4),
            berlakuHingga: simulateOCRErrors(baseData.berlakuHingga, errorRate * 0.3)
        };
    }
}

function validateAndCleanOCRData(ocrData) {
    let cleanedData = { ...ocrData };

    // Clean name - remove extra spaces and numbers
    if (cleanedData.nama) {
        cleanedData.nama = cleanedData.nama
            .replace(/[^A-Z\s]/g, '') // Remove non-letter characters
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    // Clean address - fix common OCR errors
    if (cleanedData.alamat) {
        cleanedData.alamat = cleanedData.alamat
            .replace(/NO\./g, 'NO. ')
            .replace(/RT\./g, 'RT.')
            .replace(/RW\./g, 'RW.')
            .replace(/KEL\./g, 'KEL. ')
            .replace(/KEC\./g, 'KEC. ')
            .replace(/(\d)\/(\d)/g, '$1/$2') // Fix RT/RW format
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Extract birth date from tempatTanggalLahir if available
    if (cleanedData.tempatTanggalLahir) {
        const dateMatch = cleanedData.tempatTanggalLahir.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (dateMatch) {
            const [, day, month, year] = dateMatch;
            cleanedData.tanggalLahir = `${year}-${month}-${day}`;
        }
    }

    // Clean NIK/SIM numbers - keep only digits
    if (cleanedData.nik) {
        cleanedData.nik = cleanedData.nik.replace(/\D/g, '');
    }
    if (cleanedData.nomorSIM) {
        cleanedData.nomorSIM = cleanedData.nomorSIM.replace(/\D/g, '');
    }

    return cleanedData;
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
});

// Load customers from localStorage or use sample data
function loadCustomers() {
    const savedCustomers = localStorage.getItem('hotelCustomers');
    if (savedCustomers) {
        customers = JSON.parse(savedCustomers);
        // Migrate old data to new structure
        customers = customers.map(migrateCustomerData);
    } else {
        customers = sampleCustomers.map(customer => ({
            ...customer,
            id: generateId()
        }));
        saveCustomers();
    }
}

// Migrate customer data to new structure
function migrateCustomerData(customer) {
    const migrated = { ...customer };

    // Split alamat into alamat and kota if kota doesn't exist
    if (!migrated.kota && migrated.alamat) {
        const parts = migrated.alamat.split(',').map(p => p.trim());
        if (parts.length > 1) {
            migrated.alamat = parts.slice(0, -1).join(', ');
            migrated.kota = parts[parts.length - 1];
        } else {
            migrated.kota = '';
        }
    }

    // Add default values for new fields
    migrated.kamar = migrated.kamar || '';
    migrated.pekerjaan = migrated.pekerjaan || '';
    migrated.idType = migrated.idType || 'KTP';
    migrated.idNumber = migrated.idNumber || '';
    migrated.checkinDate = migrated.checkinDate || '';
    migrated.checkoutDate = migrated.checkoutDate || '';
    migrated.checkinTime = migrated.checkinTime || '';
    migrated.checkoutTime = migrated.checkoutTime || '';
    migrated.isReturningGuest = migrated.isReturningGuest || false;

    return migrated;
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('hotelCustomers', JSON.stringify(customers));
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Customer form submission
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);

    // Profile forms
    const usernameForm = document.getElementById('username-form');
    if (usernameForm) {
        usernameForm.addEventListener('submit', handleUsernameChange);
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }

    // CSV import functionality
    document.getElementById('csv-file').addEventListener('change', handleCSVFileSelect);

    // File upload functionality - Fixed implementation
    const fileInput = document.getElementById('ktp-file');
    const uploadArea = document.getElementById('upload-area');
    
    // Click upload area to trigger file input
    uploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Handle file input change
    fileInput.addEventListener('change', handleKtpUpload);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--color-primary)';
        uploadArea.style.backgroundColor = 'rgba(31, 184, 205, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--color-border)';
        uploadArea.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--color-border)';
        uploadArea.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            fileInput.files = files;
            handleKtpUpload({ target: { files } });
        }
    });
}

// Navigation functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Add active class to clicked nav link
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update content based on page
    switch(pageId) {
        case 'dashboard':
            updateDashboard();
            setTimeout(() => {
                updateRegistrationChart();
                updateFrequentGuestsChart();
            }, 100);
            break;
        case 'customers':
            updateCustomerTable();
            break;
        case 'reminders':
            updateBirthdays();
            break;
        case 'analytics':
            setTimeout(() => {
                updateAnalytics();
            }, 100);
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Update dashboard statistics and charts
function updateDashboard() {
    const totalCustomers = customers.length;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate statistics
    const birthdaysThisMonth = customers.filter(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        return birthDate.getMonth() === currentMonth;
    }).length;
    
    const frequentGuests = customers.filter(customer => customer.jumlahMenginap >= 5).length;
    
    const newCustomersThisMonth = customers.filter(customer => {
        const createdDate = new Date(customer.dateCreated);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Calculate top city
    const cityCounts = {};
    customers.forEach(customer => {
        const city = customer.kota || 'Tidak Diketahui';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const topCity = Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

    // Update DOM elements
    document.getElementById('total-customers').textContent = totalCustomers;
    document.getElementById('birthdays-this-month').textContent = birthdaysThisMonth;
    document.getElementById('frequent-guests').textContent = frequentGuests;
    document.getElementById('new-customers-month').textContent = newCustomersThisMonth;
    document.getElementById('top-city').textContent = topCity;
}

// Update registration trends chart
function updateRegistrationChart() {
    const ctx = document.getElementById('registrationChart');
    if (!ctx) return;
    
    if (charts.registration) {
        charts.registration.destroy();
    }
    
    // Group customers by month
    const monthlyData = {};
    customers.forEach(customer => {
        const date = new Date(customer.dateCreated);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(label => monthlyData[label]);
    
    charts.registration = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Customer Baru',
                data: data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update frequent guests chart
function updateFrequentGuestsChart() {
    const ctx = document.getElementById('frequentGuestsChart');
    if (!ctx) return;
    
    if (charts.frequentGuests) {
        charts.frequentGuests.destroy();
    }
    
    // Sort customers by stay count and get top 10
    const topCustomers = customers
        .sort((a, b) => b.jumlahMenginap - a.jumlahMenginap)
        .slice(0, 10);
    
    const labels = topCustomers.map(customer => customer.nama);
    const data = topCustomers.map(customer => customer.jumlahMenginap);
    
    charts.frequentGuests = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Menginap',
                data: data,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Customer management functions
function showAddCustomerForm() {
    currentEditingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Customer';
    document.getElementById('customer-form').reset();
    resetKtpUpload();
    document.getElementById('customer-modal').classList.remove('hidden');
}

function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    currentEditingId = id;
    document.getElementById('modal-title').textContent = 'Edit Customer';

    // Fill form with customer data
    document.getElementById('customer-nama').value = customer.nama;
    document.getElementById('customer-email').value = customer.email;
    document.getElementById('customer-alamat').value = customer.alamat;
    document.getElementById('customer-kota').value = customer.kota || '';
    document.getElementById('customer-noHp').value = customer.noHp;
    document.getElementById('customer-tanggalLahir').value = customer.tanggalLahir;
    document.getElementById('customer-jumlahMenginap').value = customer.jumlahMenginap;
    document.getElementById('customer-kamar').value = customer.kamar || '';
    document.getElementById('customer-pekerjaan').value = customer.pekerjaan || '';
    document.getElementById('customer-idType').value = customer.idType || 'KTP';
    document.getElementById('customer-idNumber').value = customer.idNumber || '';
    document.getElementById('customer-checkinDate').value = customer.checkinDate || '';
    document.getElementById('customer-checkoutDate').value = customer.checkoutDate || '';
    document.getElementById('customer-checkinTime').value = customer.checkinTime || '';
    document.getElementById('customer-checkoutTime').value = customer.checkoutTime || '';
    document.getElementById('customer-isReturningGuest').checked = customer.isReturningGuest || false;

    resetKtpUpload();
    document.getElementById('customer-modal').classList.remove('hidden');
}

function deleteCustomer(id) {
    console.log('Current user:', currentUser); // Debug log
    console.log('User role:', currentUser ? currentUser.role : 'No user'); // Debug log

    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Akses ditolak! Hanya administrator yang dapat menghapus data customer.', 'error');
        console.log('Access denied: User is not admin'); // Debug log
        return;
    }
    deleteCustomerId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function confirmDelete() {
    console.log('confirmDelete - Current user:', currentUser); // Debug log
    console.log('confirmDelete - User role:', currentUser ? currentUser.role : 'No user'); // Debug log

    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Akses ditolak! Hanya administrator yang dapat menghapus data customer.', 'error');
        console.log('confirmDelete - Access denied: User is not admin'); // Debug log
        closeDeleteModal();
        return;
    }

    if (deleteCustomerId) {
        customers = customers.filter(c => c.id !== deleteCustomerId);
        saveCustomers();
        currentPage = 1; // Reset to first page when deleting customer
        updateCustomerTable();
        updateDashboard();
        closeDeleteModal();
        showNotification('Customer berhasil dihapus!', 'success');
    }
}

function closeDeleteModal() {
    deleteCustomerId = null;
    document.getElementById('delete-modal').classList.add('hidden');
}

function extendStay(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    // Increase jumlah menginap by 1
    customer.jumlahMenginap += 1;

    // Save to localStorage
    saveCustomers();

    // Update dashboard and table
    updateDashboard();
    updateCustomerTable();

    showNotification(`Menginap ${customer.nama} berhasil diperpanjang. Total menginap: ${customer.jumlahMenginap}`, 'success');
}

function closeCustomerModal() {
    currentEditingId = null;
    document.getElementById('customer-modal').classList.add('hidden');
    resetKtpUpload();
}

// Handle customer form submission
function handleCustomerSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('customer-email').value;
    const formData = {
        nama: document.getElementById('customer-nama').value,
        email: email,
        alamat: document.getElementById('customer-alamat').value,
        kota: document.getElementById('customer-kota').value,
        noHp: document.getElementById('customer-noHp').value,
        tanggalLahir: document.getElementById('customer-tanggalLahir').value,
        jumlahMenginap: parseInt(document.getElementById('customer-jumlahMenginap').value) || 0,
        kamar: document.getElementById('customer-kamar').value,
        pekerjaan: document.getElementById('customer-pekerjaan').value,
        idType: document.getElementById('customer-idType').value,
        idNumber: document.getElementById('customer-idNumber').value,
        checkinDate: document.getElementById('customer-checkinDate').value,
        checkoutDate: document.getElementById('customer-checkoutDate').value,
        checkinTime: document.getElementById('customer-checkinTime').value,
        checkoutTime: document.getElementById('customer-checkoutTime').value,
        isReturningGuest: document.getElementById('customer-isReturningGuest').checked
    };

    // Validate email format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Format email tidak valid', 'error');
            return;
        }
    }
    
    if (currentEditingId) {
        // Update existing customer
        const customerIndex = customers.findIndex(c => c.id === currentEditingId);
        if (customerIndex !== -1) {
            customers[customerIndex] = { ...customers[customerIndex], ...formData };
        }
    } else {
        // Add new customer
        const newCustomer = {
            id: generateId(),
            ...formData,
            dateCreated: new Date().toISOString().split('T')[0]
        };
        customers.push(newCustomer);
    }
    
    saveCustomers();
    currentPage = 1; // Reset to first page when adding new customer
    updateCustomerTable();
    updateDashboard();
    closeCustomerModal();
    
    // Show success message
    showNotification('Customer berhasil disimpan!', 'success');
}

// Update customer table with pagination
function updateCustomerTable() {
    const tbody = document.getElementById('customer-table-body');
    const adminNotice = document.getElementById('admin-notice');
    if (!tbody) return;

    console.log('updateCustomerTable - Current user:', currentUser); // Debug log
    console.log('updateCustomerTable - User role:', currentUser ? currentUser.role : 'No user'); // Debug log

    // Show admin notice for non-admin users
    if (adminNotice) {
        adminNotice.style.display = (!currentUser || currentUser.role !== 'admin') ? 'block' : 'none';
    }

    const filteredCustomers = getFilteredCustomers();

    // Sort by creation date (newest first)
    filteredCustomers.sort((a, b) => {
        const dateA = new Date(a.dateCreated);
        const dateB = new Date(b.dateCreated);
        return dateB - dateA; // Newest first
    });

    // Calculate pagination
    totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    tbody.innerHTML = paginatedCustomers.map(customer => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        console.log('Rendering row for customer', customer.id, '- Is admin:', isAdmin, '- Current user:', currentUser);

        return `
        <tr>
            <td>${customer.nama}</td>
            <td>${customer.email}</td>
            <td>${customer.kota || '-'}</td>
            <td>${customer.kamar || '-'}</td>
            <td>${customer.checkinDate ? formatDate(customer.checkinDate) : '-'}</td>
            <td>${customer.checkoutDate ? formatDate(customer.checkoutDate) : '-'}</td>
            <td>${customer.noHp}</td>
            <td>${formatDate(customer.tanggalLahir)}</td>
            <td>
                <span class="status ${customer.jumlahMenginap >= 5 ? 'status--success' : 'status--info'}">
                    ${customer.jumlahMenginap}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn--secondary btn--xs" onclick="editCustomer(${customer.id})">Edit</button>
                    <button class="btn btn--outline btn--xs" onclick="extendStay(${customer.id})">Perpanjang</button>
                    ${isAdmin ? `<button class="btn btn--outline btn--xs" onclick="deleteCustomer(${customer.id})">Hapus</button>` : ''}
                </div>
            </td>
        </tr>
        `;
    }).join('');

    // Update pagination UI
    updatePaginationUI(filteredCustomers.length);
}

// Get filtered customers based on search and filter
function getFilteredCustomers() {
    let filtered = [...customers];
    
    // Search filter
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(customer =>
            customer.nama.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.noHp.includes(searchTerm)
        );
    }
    
    // Category filter
    const filterValue = document.getElementById('filter-stays')?.value || '';
    if (filterValue === 'frequent') {
        filtered = filtered.filter(customer => customer.jumlahMenginap >= 5);
    } else if (filterValue === 'new') {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        filtered = filtered.filter(customer => {
            const createdDate = new Date(customer.dateCreated);
            return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        });
    }
    
    return filtered;
}

// Search customers
function searchCustomers() {
    updateCustomerTable();
}

// Filter customers
function filterCustomers() {
    currentPage = 1; // Reset to first page when filtering
    updateCustomerTable();
}

// Pagination functions
function updatePaginationUI(totalItems) {
    const paginationSection = document.getElementById('pagination-section');
    const paginationInfo = document.getElementById('pagination-info');
    const paginationPages = document.getElementById('pagination-pages');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (totalItems === 0) {
        paginationSection.style.display = 'none';
        return;
    }

    paginationSection.style.display = 'flex';

    // Update info text
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    paginationInfo.textContent = `Menampilkan ${startItem}-${endItem} dari ${totalItems} customer`;

    // Update navigation buttons
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    // Generate page buttons
    paginationPages.innerHTML = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page button if not visible
    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.className = 'pagination-page';
        firstButton.textContent = '1';
        firstButton.onclick = () => goToPage(1);
        paginationPages.appendChild(firstButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.margin = '0 4px';
            paginationPages.appendChild(ellipsis);
        }
    }

    // Add visible page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        paginationPages.appendChild(pageButton);
    }

    // Add last page button if not visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.margin = '0 4px';
            paginationPages.appendChild(ellipsis);
        }

        const lastButton = document.createElement('button');
        lastButton.className = 'pagination-page';
        lastButton.textContent = totalPages;
        lastButton.onclick = () => goToPage(totalPages);
        paginationPages.appendChild(lastButton);
    }
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        goToPage(newPage);
    }
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateCustomerTable();
        // Scroll to top of table
        document.getElementById('customer-table').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// KTP Upload and OCR functions - Fixed implementation
function handleKtpUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('File harus berupa gambar (JPG, PNG, dll)', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Ukuran file tidak boleh lebih dari 5MB', 'error');
        return;
    }

    // Update file info
    const fileInfo = document.getElementById('file-info');
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    fileInfo.textContent = `${file.name} (${fileSizeMB} MB)`;
    fileInfo.style.color = 'var(--color-success)';

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('ktp-preview');
        const uploadPreview = document.getElementById('upload-preview');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');

        preview.src = e.target.result;
        uploadPreview.classList.remove('hidden');
        uploadPlaceholder.style.display = 'none';

        showNotification('File berhasil diupload. Memproses OCR otomatis...', 'success');

        // Automatically start OCR processing after a short delay
        setTimeout(() => {
            processOCRAutomatic();
        }, 1000);
    };

    reader.onerror = function() {
        showNotification('Gagal membaca file. Silakan coba lagi.', 'error');
    };

    reader.readAsDataURL(file);
}

function clearKtpUpload() {
    const fileInput = document.getElementById('ktp-file');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const fileInfo = document.getElementById('file-info');
    const ocrStatus = document.getElementById('ocr-status');

    // Clear file input
    fileInput.value = '';

    // Reset UI
    uploadPreview.classList.add('hidden');
    uploadPlaceholder.style.display = 'block';
    fileInfo.textContent = 'Belum ada file dipilih';
    fileInfo.style.color = 'var(--color-text-secondary)';

    // Clear OCR status
    ocrStatus.className = 'ocr-status';
    ocrStatus.textContent = '';

    showNotification('File KTP telah dihapus', 'info');
}

function processOCR() {
    const status = document.getElementById('ocr-status');
    const preview = document.getElementById('ktp-preview');

    if (!preview.src) {
        showNotification('Silakan upload file KTP terlebih dahulu', 'error');
        return;
    }

    // Show processing status
    status.className = 'ocr-status processing';
    status.textContent = 'Memproses OCR... Harap tunggu.';

    // Simulate OCR processing delay with multiple attempts
    setTimeout(() => {
        let ocrData;
        let attempts = 0;
        const maxAttempts = 3;

        do {
            ocrData = extractKTPDataFromImage();
            ocrData = validateAndCleanOCRData(ocrData);
            attempts++;
        } while (attempts < maxAttempts && (!ocrData.nama || ocrData.nama.length < 3));

        // Fill form with OCR data
        document.getElementById('customer-nama').value = ocrData.nama || '';

        // Handle address - extract city from full address for KTP
        if (ocrData.alamat) {
            const addressLines = ocrData.alamat.split('\n');
            if (addressLines.length > 0) {
                // First line is usually street address
                document.getElementById('customer-alamat').value = addressLines[0];

                // Try to extract city from the last meaningful line
                for (let i = addressLines.length - 1; i >= 0; i--) {
                    const line = addressLines[i].trim();
                    if (line && !line.startsWith('KEL.') && !line.startsWith('KEC.') && line.length > 2) {
                        document.getElementById('customer-kota').value = line;
                        break;
                    }
                }
            }
        }

        // Set birth date if extracted
        if (ocrData.tanggalLahir) {
            document.getElementById('customer-tanggalLahir').value = ocrData.tanggalLahir;
        }

        // Set ID type and number
        if (ocrData.idType) {
            document.getElementById('customer-idType').value = ocrData.idType;
            if (ocrData.idType === 'KTP' && ocrData.nik) {
                document.getElementById('customer-idNumber').value = ocrData.nik;
            } else if (ocrData.idType === 'SIM' && ocrData.nomorSIM) {
                document.getElementById('customer-idNumber').value = ocrData.nomorSIM;
            }
        }

        // Set occupation if available
        if (ocrData.pekerjaan) {
            document.getElementById('customer-pekerjaan').value = ocrData.pekerjaan;
        }

        // Email and phone are left empty as requested
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-noHp').value = '';

        // Calculate confidence score based on extracted fields
        let scoreCount = 0;
        let totalScore = 0;

        // Name (most important)
        if (ocrData.nama && ocrData.nama.length > 3) {
            totalScore += 1;
        }
        scoreCount++;

        // Address
        if (ocrData.alamat && ocrData.alamat.length > 10) {
            totalScore += 1;
        }
        scoreCount++;

        // ID Number (NIK/SIM)
        if ((ocrData.nik && ocrData.nik.length >= 12) || (ocrData.nomorSIM && ocrData.nomorSIM.length >= 12)) {
            totalScore += 1;
        }
        scoreCount++;

        // Birth date
        if (ocrData.tanggalLahir && /^\d{4}-\d{2}-\d{2}$/.test(ocrData.tanggalLahir)) {
            totalScore += 1;
        }
        scoreCount++;

        // ID Type
        if (ocrData.idType && ['KTP', 'SIM'].includes(ocrData.idType)) {
            totalScore += 0.5; // Half weight for ID type
        }

        const confidenceScore = Math.round((totalScore / scoreCount) * 100);

        // Determine success based on data quality
        const hasGoodName = ocrData.nama && ocrData.nama.length > 3;
        const hasAddress = ocrData.alamat && ocrData.alamat.length > 10;

        if (confidenceScore >= 75) {
            status.className = 'ocr-status success';
            status.textContent = `OCR berhasil! Akurasi: ${confidenceScore}% (${attempts} percobaan). Data telah diisi otomatis.`;
            showNotification(`OCR berhasil dengan akurasi ${confidenceScore}%!`, 'success');
        } else if (confidenceScore >= 50) {
            status.className = 'ocr-status warning';
            status.textContent = `OCR berhasil dengan akurasi sedang: ${confidenceScore}% (${attempts} percobaan). Silakan periksa data.`;
            showNotification(`OCR berhasil dengan akurasi ${confidenceScore}%. Periksa data dengan teliti.`, 'warning');
        } else {
            status.className = 'ocr-status error';
            status.textContent = `OCR kurang akurat: ${confidenceScore}% (${attempts} percobaan). Data mungkin perlu diperbaiki manual.`;
            showNotification(`OCR akurasi rendah (${confidenceScore}%). Periksa dan koreksi data manual.`, 'error');
        }

        // Clear status after 8 seconds
        setTimeout(() => {
            status.className = 'ocr-status';
            status.textContent = '';
        }, 8000);
    }, 2500); // Slightly longer delay for "processing"
}

// Real OCR processing using Tesseract.js
async function processOCRAutomatic() {
    const status = document.getElementById('ocr-status');
    const preview = document.getElementById('ktp-preview');

    if (!preview.src) {
        showNotification('Silakan upload file KTP terlebih dahulu', 'error');
        return;
    }

    // Show processing status
    status.className = 'ocr-status processing';
    status.textContent = '🔍 Memproses OCR dengan Tesseract.js...';

    try {
        // Create Tesseract worker
        const worker = await Tesseract.createWorker();

        // Load English language for better OCR accuracy with Indonesian documents
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        status.textContent = '🔍 OCR: Menggunakan bahasa Inggris...';

        // Set parameters for better OCR accuracy with Indonesian documents
        await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,/-() áéíóúÁÉÍÓÚñÑ',
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
            tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        });

        status.textContent = '🔍 OCR: Menganalisis gambar...';

        // Perform OCR
        const { data: { text, confidence } } = await worker.recognize(preview.src);

        status.textContent = '🔍 OCR: Memproses teks yang ditemukan...';

        // Terminate worker
        await worker.terminate();

        // Parse the OCR text into KTP data
        const ocrData = parseKTPText(text);

        // Fill form with OCR data
        document.getElementById('customer-nama').value = ocrData.nama || '';

        // Handle address - extract city from full address
        if (ocrData.alamat) {
            const addressLines = ocrData.alamat.split('\n');
            if (addressLines.length > 0) {
                // First line is usually street address
                document.getElementById('customer-alamat').value = addressLines[0];

                // Try to extract city from the last meaningful line
                for (let i = addressLines.length - 1; i >= 0; i--) {
                    const line = addressLines[i].trim();
                    if (line && !line.startsWith('KEL.') && !line.startsWith('KEC.') &&
                        !line.startsWith('RT.') && !line.startsWith('RW.') && line.length > 2) {
                        document.getElementById('customer-kota').value = line;
                        break;
                    }
                }
            }
        }

        // Set birth date if extracted
        if (ocrData.tanggalLahir) {
            document.getElementById('customer-tanggalLahir').value = ocrData.tanggalLahir;
        }

        // Set ID type and number
        if (ocrData.idType) {
            document.getElementById('customer-idType').value = ocrData.idType;
            if (ocrData.idType === 'KTP' && ocrData.nik) {
                document.getElementById('customer-idNumber').value = ocrData.nik;
            } else if (ocrData.idType === 'SIM' && ocrData.nomorSIM) {
                document.getElementById('customer-idNumber').value = ocrData.nomorSIM;
            }
        }

        // Set occupation if available
        if (ocrData.pekerjaan) {
            document.getElementById('customer-pekerjaan').value = ocrData.pekerjaan;
        }

        // Email and phone are left empty as requested
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-noHp').value = '';

        // Calculate confidence score based on extracted fields and OCR confidence
        let scoreCount = 0;
        let totalScore = 0;

        // Name (most important)
        if (ocrData.nama && ocrData.nama.length > 3) {
            totalScore += 1;
        }
        scoreCount++;

        // Address
        if (ocrData.alamat && ocrData.alamat.length > 10) {
            totalScore += 1;
        }
        scoreCount++;

        // ID Number (NIK/SIM)
        if ((ocrData.nik && ocrData.nik.length >= 12) || (ocrData.nomorSIM && ocrData.nomorSIM.length >= 12)) {
            totalScore += 1;
        }
        scoreCount++;

        // Birth date
        if (ocrData.tanggalLahir && /^\d{4}-\d{2}-\d{2}$/.test(ocrData.tanggalLahir)) {
            totalScore += 1;
        }
        scoreCount++;

        // ID Type
        if (ocrData.idType && ['KTP', 'SIM'].includes(ocrData.idType)) {
            totalScore += 0.5; // Half weight for ID type
        }

        // Factor in Tesseract confidence (0-100)
        const ocrConfidence = confidence || 0;
        const combinedConfidence = Math.round(((totalScore / scoreCount) * 100 + ocrConfidence) / 2);

        // Show results with appropriate messaging
        if (combinedConfidence >= 80) {
            status.className = 'ocr-status success';
            status.textContent = `✅ OCR berhasil! Akurasi: ${combinedConfidence}% (Tesseract: ${Math.round(ocrConfidence)}%)`;
            showNotification(`Data berhasil diisi otomatis dengan akurasi ${combinedConfidence}%!`, 'success');
        } else if (combinedConfidence >= 60) {
            status.className = 'ocr-status warning';
            status.textContent = `⚠️ OCR selesai dengan akurasi ${combinedConfidence}%. Periksa data sebelum menyimpan.`;
            showNotification(`Data terisi otomatis, namun akurasi sedang (${combinedConfidence}%). Harap periksa kembali.`, 'warning');
        } else {
            status.className = 'ocr-status error';
            status.textContent = `❌ OCR akurasi rendah (${combinedConfidence}%). Silakan isi manual atau upload gambar yang lebih jelas.`;
            showNotification(`OCR gagal mengenali data dengan baik. Silakan isi manual atau coba upload gambar yang lebih jelas.`, 'error');
        }

        // Clear status after 12 seconds
        setTimeout(() => {
            status.className = 'ocr-status';
            status.textContent = '';
        }, 12000);

    } catch (error) {
        console.error('OCR Error:', error);
        status.className = 'ocr-status error';
        status.textContent = '❌ Error OCR: ' + error.message;
        showNotification('Terjadi kesalahan saat memproses OCR. Silakan coba lagi.', 'error');

        // Clear status after 8 seconds
        setTimeout(() => {
            status.className = 'ocr-status';
            status.textContent = '';
        }, 8000);
    }
}

// Parse OCR text into KTP/SIM data structure
function parseKTPText(ocrText) {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const result = {
        idType: null,
        nama: '',
        nik: '',
        nomorSIM: '',
        tempatTanggalLahir: '',
        tanggalLahir: '',
        alamat: '',
        pekerjaan: ''
    };

    // Check if it's KTP or SIM
    const upperText = ocrText.toUpperCase();
    if (upperText.includes('KARTU TANDA PENDUDUK') || upperText.includes('KTP')) {
        result.idType = 'KTP';
    } else if (upperText.includes('SURAT IZIN MENGEMUDI') || upperText.includes('SIM')) {
        result.idType = 'SIM';
    }

    // Extract NIK (16 digits) - look for it near "NIK" or as standalone 16-digit number
    const nikPatterns = [
        /NIK\s*:?\s*(\d{16})/i,
        /NIK\s*(\d{16})/i,
        /ID\s*Number\s*:?\s*(\d{16})/i,
        /ID\s*No\s*:?\s*(\d{16})/i,
        /(\d{16})(?:\s|$)/g  // Standalone 16-digit number
    ];

    for (const pattern of nikPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
            // Validate that it's likely a NIK (starts with valid area codes)
            const nik = match[1];
            const areaCode = nik.substring(0, 4);
            if (['3171', '3172', '3173', '3174', '3175', '3201', '3202', '3216', '3211', '3603', '3324', '3311', '3326', '3328', '3308', '3571', '3507', '3515', '3525', '3524'].some(code => areaCode.startsWith(code.substring(0, 2)))) {
                result.nik = nik;
                break;
            }
        }
    }

    // Extract SIM number (12 digits)
    const simMatch = ocrText.match(/(\d{12})/);
    if (simMatch && !result.nik) {
        result.nomorSIM = simMatch[1];
    }

    // Extract name - more specific patterns to avoid picking up provinces/cities
    const namePatterns = [
        /Nama\s*:?\s*([A-Z][A-Z\s]{2,}(?:\s[A-Z][A-Z\s]*)*)/i,
        /NAMA\s*:?\s*([A-Z][A-Z\s]{2,}(?:\s[A-Z][A-Z\s]*)*)/i,
        /Name\s*:?\s*([A-Z][A-Z\s]{2,}(?:\s[A-Z][A-Z\s]*)*)/i,
        /NAME\s*:?\s*([A-Z][A-Z\s]{2,}(?:\s[A-Z][A-Z\s]*)*)/i,
        // Look for name after "NIK" or "KTP" and before address
        /(?:NIK|KTP)\s*\d+\s*([A-Z][A-Z\s]{3,}(?:\s[A-Z][A-Z\s]*)*)/i
    ];

    for (const pattern of namePatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
            const potentialName = match[1].trim();
            // Exclude common province/city names and administrative terms
            const excludeTerms = ['DKI JAKARTA', 'JAWA BARAT', 'JAWA TIMUR', 'JAWA TENGAH', 'YOGYAKARTA', 'JAKARTA', 'BANDUNG', 'SURABAYA', 'SEMARANG', 'MEDAN', 'PALEMBANG', 'MAKASSAR', 'DENPASAR', 'KELURAHAN', 'KECAMATAN', 'PROVINSI'];
            if (!excludeTerms.some(term => potentialName.toUpperCase().includes(term)) && potentialName.length > 3 && potentialName.length < 50) {
                result.nama = potentialName;
                break;
            }
        }
    }

    // Extract birth date with better patterns
    const datePatterns = [
        /Tempat\/Tanggal\s*Lahir\s*:?\s*([^,\n]+),\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /TTL\s*:?\s*([^,\n]+),\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /Tanggal\s*Lahir\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /Birth\s*Date\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /Date\s*of\s*Birth\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
    ];

    for (const pattern of datePatterns) {
        const match = ocrText.match(pattern);
        if (match) {
            if (match[2]) {
                // Has place and date
                result.tempatTanggalLahir = `${match[1].trim()}, ${match[2]}`;
                result.tanggalLahir = normalizeDate(match[2]);
            } else if (match[1]) {
                // Just date
                result.tanggalLahir = normalizeDate(match[1]);
            }
            break;
        }
    }

    // Extract address with better boundary detection
    const addressPatterns = [
        /Alamat\s*:?\s*([\s\S]*?)(?:\n\s*(?:Pekerjaan|Agama|Status|Berlaku|Gol\.?\s*Darah|$))/i,
        /ALAMAT\s*:?\s*([\s\S]*?)(?:\n\s*(?:Pekerjaan|Agama|Status|Berlaku|Gol\.?\s*Darah|$))/i,
        /Address\s*:?\s*([\s\S]*?)(?:\n\s*(?:Occupation|Religion|Status|Valid|Blood|$))/i,
        /ADDRESS\s*:?\s*([\s\S]*?)(?:\n\s*(?:Occupation|Religion|Status|Valid|Blood|$))/i
    ];

    for (const pattern of addressPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
            result.alamat = match[1].trim();
            break;
        }
    }

    // If no address found with patterns, try to find address-like content between specific markers
    if (!result.alamat) {
        let addressStart = -1;
        let addressEnd = -1;

        // Find address start (after "Alamat" or similar)
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toUpperCase().includes('ALAMAT') || lines[i].toUpperCase().includes('ALAMAT')) {
                addressStart = i + 1;
                break;
            }
        }

        // Find address end (before "Pekerjaan", "Agama", etc.)
        if (addressStart !== -1) {
            for (let i = addressStart; i < lines.length; i++) {
                if (lines[i].toUpperCase().includes('PEKERJAAN') ||
                    lines[i].toUpperCase().includes('AGAMA') ||
                    lines[i].toUpperCase().includes('STATUS') ||
                    lines[i].toUpperCase().includes('BERLAKU') ||
                    lines[i].toUpperCase().includes('GOL. DARAH')) {
                    addressEnd = i;
                    break;
                }
            }

            if (addressEnd === -1) addressEnd = Math.min(addressStart + 5, lines.length);

            const addressLines = lines.slice(addressStart, addressEnd);
            result.alamat = addressLines.join('\n');
        }
    }

    // Extract occupation with better patterns
    const occupationPatterns = [
        /Pekerjaan\s*:?\s*([A-Z][A-Z\s]{2,})/i,
        /PEKERJAAN\s*:?\s*([A-Z][A-Z\s]{2,})/i,
        /Pekerjaan\s*([A-Z][A-Z\s]{2,})/i,
        /Occupation\s*:?\s*([A-Z][A-Z\s]{2,})/i,
        /OCCUPATION\s*:?\s*([A-Z][A-Z\s]{2,})/i,
        /Job\s*:?\s*([A-Z][A-Z\s]{2,})/i
    ];

    for (const pattern of occupationPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1]) {
            const occupation = match[1].trim();
            // Exclude common non-occupation terms
            const excludeTerms = ['TIDAK/BELUM', 'BELUM/TIDAK', 'KAWIN', 'BELUM KAWIN', 'LAKI-LAKI', 'PEREMPUAN'];
            if (!excludeTerms.some(term => occupation.toUpperCase().includes(term)) && occupation.length > 2 && occupation.length < 30) {
                result.pekerjaan = occupation;
                break;
            }
        }
    }

    return result;
}

// Normalize date formats to DD/MM/YYYY for display
function normalizeDate(dateStr) {
    // Handle various date formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
    const dateMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dateMatch) {
        const [, day, month, year] = dateMatch;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    // Handle YYYY-MM-DD format
    const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    return '';
}

function resetKtpUpload() {
    const fileInput = document.getElementById('ktp-file');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const ocrStatus = document.getElementById('ocr-status');
    const fileInfo = document.getElementById('file-info');

    if (fileInput) fileInput.value = '';
    if (uploadPreview) uploadPreview.classList.add('hidden');
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
    if (ocrStatus) {
        ocrStatus.className = 'ocr-status';
        ocrStatus.textContent = '';
    }
    if (fileInfo) {
        fileInfo.textContent = 'Belum ada file dipilih';
        fileInfo.style.color = 'var(--color-text-secondary)';
    }
}

// Birthday reminder functions
function updateBirthdays() {
    updateTodayBirthdays();
    updateUpcomingBirthdays();
    updateBirthdayCalendar();
}

function updateTodayBirthdays() {
    const today = new Date();
    const todayCustomers = customers.filter(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();
    });
    
    const container = document.getElementById('today-birthdays-list');
    if (!container) return;
    
    if (todayCustomers.length === 0) {
        container.innerHTML = '<div class="birthday-item"><div class="birthday-info"><p>Tidak ada ulang tahun hari ini.</p></div></div>';
        return;
    }
    
    container.innerHTML = todayCustomers.map(customer => `
        <div class="birthday-item birthday-today">
            <div class="birthday-info">
                <h4>${customer.nama}</h4>
                <p>${customer.email} • ${customer.noHp}</p>
                <p>Menginap ${customer.jumlahMenginap} kali</p>
            </div>
            <div class="birthday-date">🎂 Hari Ini!</div>
        </div>
    `).join('');
}

function updateUpcomingBirthdays() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingCustomers = customers.filter(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday already passed this year, check next year
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        return thisYearBirthday > today && thisYearBirthday <= nextWeek;
    }).sort((a, b) => {
        const aDate = new Date(today.getFullYear(), new Date(a.tanggalLahir).getMonth(), new Date(a.tanggalLahir).getDate());
        const bDate = new Date(today.getFullYear(), new Date(b.tanggalLahir).getMonth(), new Date(b.tanggalLahir).getDate());
        return aDate - bDate;
    });
    
    const container = document.getElementById('upcoming-birthdays-list');
    if (!container) return;
    
    if (upcomingCustomers.length === 0) {
        container.innerHTML = '<div class="birthday-item"><div class="birthday-info"><p>Tidak ada ulang tahun dalam 7 hari ke depan.</p></div></div>';
        return;
    }
    
    container.innerHTML = upcomingCustomers.map(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysDiff = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="birthday-item">
                <div class="birthday-info">
                    <h4>${customer.nama}</h4>
                    <p>${customer.email} • ${customer.noHp}</p>
                    <p>Menginap ${customer.jumlahMenginap} kali</p>
                </div>
                <div class="birthday-date">${daysDiff} hari lagi</div>
            </div>
        `;
    }).join('');
}

function updateBirthdayCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const container = document.getElementById('birthday-calendar');
    if (!container) return;
    
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Get customers with birthdays this month
    const monthBirthdays = customers.filter(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        return birthDate.getMonth() === currentMonth;
    });
    
    const birthdayDates = {};
    monthBirthdays.forEach(customer => {
        const day = new Date(customer.tanggalLahir).getDate();
        if (!birthdayDates[day]) birthdayDates[day] = [];
        birthdayDates[day].push(customer);
    });
    
    let html = `
        <div class="calendar-month">${monthNames[currentMonth]} ${currentYear}</div>
        <div class="calendar-days">
    `;
    
    // Add day headers
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Add calendar days
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const isCurrentMonth = currentDate.getMonth() === currentMonth;
        const hasBirthday = birthdayDates[currentDate.getDate()];
        const isToday = currentDate.toDateString() === today.toDateString();
        
        let classes = 'calendar-day';
        if (!isCurrentMonth) classes += ' other-month';
        if (hasBirthday && isCurrentMonth) classes += ' has-birthday';
        if (isToday) classes += ' today';
        
        html += `<div class="${classes}" title="${hasBirthday && isCurrentMonth ? hasBirthday.map(c => c.nama).join(', ') : ''}">${currentDate.getDate()}</div>`;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Analytics functions
function updateAnalytics() {
    updateAgeChart();
    updateBirthdayDistributionChart();
    updateCityChart();
}

function updateAgeChart() {
    const ctx = document.getElementById('ageChart');
    if (!ctx) return;
    
    if (charts.age) {
        charts.age.destroy();
    }
    
    const today = new Date();
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '55+': 0
    };
    
    customers.forEach(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        if (actualAge <= 25) ageGroups['18-25']++;
        else if (actualAge <= 35) ageGroups['26-35']++;
        else if (actualAge <= 45) ageGroups['36-45']++;
        else if (actualAge <= 55) ageGroups['46-55']++;
        else ageGroups['55+']++;
    });
    
    charts.age = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ageGroups),
            datasets: [{
                data: Object.values(ageGroups),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateBirthdayDistributionChart() {
    const ctx = document.getElementById('birthdayChart');
    if (!ctx) return;

    if (charts.birthday) {
        charts.birthday.destroy();
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthCounts = new Array(12).fill(0);

    customers.forEach(customer => {
        const birthDate = new Date(customer.tanggalLahir);
        monthCounts[birthDate.getMonth()]++;
    });

    charts.birthday = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Jumlah Ulang Tahun',
                data: monthCounts,
                backgroundColor: '#1FB8CD'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCityChart() {
    const ctx = document.getElementById('cityChart');
    if (!ctx) return;

    if (charts.city) {
        charts.city.destroy();
    }

    // Group customers by city
    const cityCounts = {};
    customers.forEach(customer => {
        const city = customer.kota || 'Tidak Diketahui';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Sort cities by customer count (descending)
    const sortedCities = Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Show top 10 cities

    const labels = sortedCities.map(([city]) => city);
    const data = sortedCities.map(([,count]) => count);

    charts.city = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F',
                    '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
                ],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Export functionality
function exportToCSV() {
    const filteredCustomers = getFilteredCustomers();

    if (filteredCustomers.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
    }

    const headers = ['Nama', 'Email', 'Alamat', 'Kota', 'No HP', 'Tanggal Lahir', 'Jumlah Menginap', 'Kamar', 'Pekerjaan', 'Tipe ID', 'Nomor ID', 'Tanggal Check-in', 'Tanggal Check-out', 'Jam Check-in', 'Jam Check-out', 'Tamu Lama', 'Tanggal Dibuat'];
    const csvContent = [
        headers.join(','),
        ...filteredCustomers.map(customer => [
            `"${customer.nama}"`,
            `"${customer.email}"`,
            `"${customer.alamat}"`,
            `"${customer.kota || ''}"`,
            `"${customer.noHp}"`,
            customer.tanggalLahir,
            customer.jumlahMenginap,
            `"${customer.kamar || ''}"`,
            `"${customer.pekerjaan || ''}"`,
            `"${customer.idType || ''}"`,
            `"${customer.idNumber || ''}"`,
            `"${customer.checkinDate || ''}"`,
            `"${customer.checkoutDate || ''}"`,
            `"${customer.checkinTime || ''}"`,
            `"${customer.checkoutTime || ''}"`,
            customer.isReturningGuest ? 'Ya' : 'Tidak',
            customer.dateCreated
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customer_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Data ${filteredCustomers.length} customer berhasil diekspor ke CSV`, 'success');
}

// Import CSV functionality
let csvData = [];
let csvHeaders = [];

function showImportModal() {
    document.getElementById('import-modal').classList.remove('hidden');
    resetImportModal();
}

function closeImportModal() {
    document.getElementById('import-modal').classList.add('hidden');
    resetImportModal();
}

function resetImportModal() {
    document.getElementById('csv-file').value = '';
    document.getElementById('import-preview').classList.add('hidden');
    document.getElementById('import-status').className = 'import-status';
    document.getElementById('import-status').textContent = '';
    document.getElementById('preview-btn').disabled = true;
    document.getElementById('import-btn').disabled = true;
    csvData = [];
    csvHeaders = [];
}

function handleCSVFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        resetImportModal();
        return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showImportStatus('File harus berformat CSV', 'error');
        resetImportModal();
        return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showImportStatus('Ukuran file tidak boleh lebih dari 10MB', 'error');
        resetImportModal();
        return;
    }

    document.getElementById('preview-btn').disabled = false;
    showImportStatus('File CSV berhasil dipilih. Klik "Pratinjau" untuk melihat data.', 'success');
}

function previewCSV() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        showImportStatus('Silakan pilih file CSV terlebih dahulu', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const lines = csvText.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                showImportStatus('File CSV harus memiliki minimal 1 baris header dan 1 baris data', 'error');
                return;
            }

            // Parse CSV
            csvHeaders = parseCSVLine(lines[0]);
            csvData = lines.slice(1).map(line => parseCSVLine(line));

            // Validate headers
            const requiredHeaders = ['nama', 'alamat'];
            const normalizedHeaders = csvHeaders.map(h => normalizeHeader(h));

            const hasRequiredHeaders = requiredHeaders.every(req =>
                normalizedHeaders.some(h => h.includes(req))
            );

            if (!hasRequiredHeaders) {
                showImportStatus('File CSV harus memiliki kolom Nama dan Alamat', 'error');
                return;
            }

            // Show preview
            showCSVPreview();
            document.getElementById('import-btn').disabled = false;
            showImportStatus(`${csvData.length} baris data siap diimport`, 'success');

        } catch (error) {
            showImportStatus('Error membaca file CSV: ' + error.message, 'error');
        }
    };

    reader.onerror = function() {
        showImportStatus('Gagal membaca file CSV', 'error');
    };

    reader.readAsText(file, 'UTF-8');
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function normalizeHeader(header) {
    return header.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function showCSVPreview() {
    const previewContainer = document.getElementById('import-preview');
    const previewTable = document.getElementById('preview-table');

    // Show first 5 rows
    const previewRows = csvData.slice(0, 5);

    let html = '<thead><tr>';
    csvHeaders.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    previewRows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell || '-'}</td>`;
        });
        html += '</tr>';
    });

    if (csvData.length > 5) {
        html += `<tr><td colspan="${csvHeaders.length}" style="text-align: center; font-style: italic;">... dan ${csvData.length - 5} baris lainnya</td></tr>`;
    }

    html += '</tbody>';
    previewTable.innerHTML = html;
    previewContainer.classList.remove('hidden');
}

function importCSV() {
    if (csvData.length === 0) {
        showImportStatus('Tidak ada data untuk diimport', 'error');
        return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    csvData.forEach((row, index) => {
        try {
            const customer = mapCSVRowToCustomer(row, index);
            if (customer) {
                customers.push(customer);
                successCount++;
            } else {
                errorCount++;
                errors.push(`Baris ${index + 2}: Data tidak valid`);
            }
        } catch (error) {
            errorCount++;
            errors.push(`Baris ${index + 2}: ${error.message}`);
        }
    });

    if (successCount > 0) {
        saveCustomers();
        currentPage = 1; // Reset to first page when importing customers
        updateCustomerTable();
        updateDashboard();
    }

    if (errorCount === 0) {
        showImportStatus(`Berhasil mengimport ${successCount} customer`, 'success');
        setTimeout(() => {
            closeImportModal();
        }, 2000);
    } else {
        let message = `Berhasil mengimport ${successCount} customer. ${errorCount} baris gagal:`;
        message += '<br><br>' + errors.slice(0, 5).join('<br>');
        if (errors.length > 5) {
            message += `<br>... dan ${errors.length - 5} error lainnya`;
        }
        showImportStatus(message, 'error');
    }
}

function mapCSVRowToCustomer(row, rowIndex) {
    const normalizedHeaders = csvHeaders.map(h => normalizeHeader(h));

    // Create customer object with defaults
    const customer = {
        id: generateId(),
        nama: '',
        email: '',
        alamat: '',
        kota: '',
        noHp: '',
        tanggalLahir: '',
        jumlahMenginap: 0,
        kamar: '',
        pekerjaan: '',
        idType: 'KTP',
        idNumber: '',
        checkinDate: '',
        checkoutDate: '',
        checkinTime: '',
        checkoutTime: '',
        isReturningGuest: false,
        dateCreated: new Date().toISOString().split('T')[0]
    };

    // Map CSV columns to customer fields
    csvHeaders.forEach((header, colIndex) => {
        const normalized = normalizeHeader(header);
        const value = row[colIndex] || '';

        if (normalized.includes('nama')) {
            customer.nama = value;
        } else if (normalized.includes('email')) {
            customer.email = value;
        } else if (normalized.includes('alamat') && !normalized.includes('kota')) {
            customer.alamat = value;
        } else if (normalized.includes('kota')) {
            customer.kota = value;
        } else if (normalized.includes('nohp') || normalized.includes('telepon') || normalized.includes('phone')) {
            customer.noHp = value;
        } else if (normalized.includes('tanggallahir') || normalized.includes('birthdate')) {
            customer.tanggalLahir = value;
        } else if (normalized.includes('jumlahmenginap') || normalized.includes('staycount')) {
            customer.jumlahMenginap = parseInt(value) || 0;
        } else if (normalized.includes('kamar') || normalized.includes('room')) {
            customer.kamar = value;
        } else if (normalized.includes('pekerjaan') || normalized.includes('occupation') || normalized.includes('job')) {
            customer.pekerjaan = value;
        } else if (normalized.includes('tipeid') || normalized.includes('idtype')) {
            customer.idType = value || 'KTP';
        } else if (normalized.includes('nomorid') || normalized.includes('idnumber')) {
            customer.idNumber = value;
        } else if (normalized.includes('tanggalcheckin') || normalized.includes('checkindate')) {
            customer.checkinDate = value;
        } else if (normalized.includes('tanggalcheckout') || normalized.includes('checkoutdate')) {
            customer.checkoutDate = value;
        } else if (normalized.includes('checkin') || normalized.includes('jamcheckin')) {
            customer.checkinTime = value;
        } else if (normalized.includes('checkout') || normalized.includes('jamcheckout')) {
            customer.checkoutTime = value;
        } else if (normalized.includes('tamulama') || normalized.includes('returning') || normalized.includes('lama')) {
            customer.isReturningGuest = value.toLowerCase().includes('ya') || value.toLowerCase().includes('true') || value === '1';
        } else if (normalized.includes('tanggaldibuat') || normalized.includes('created')) {
            customer.dateCreated = value || customer.dateCreated;
        }
    });

    // Validate required fields
    if (!customer.nama || !customer.alamat) {
        throw new Error('Nama dan Alamat wajib diisi');
    }

    // Validate email format if provided
    if (customer.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer.email)) {
            throw new Error('Format email tidak valid');
        }
    }

    return customer;
}

function showImportStatus(message, type) {
    const statusEl = document.getElementById('import-status');
    statusEl.className = `import-status ${type}`;
    statusEl.innerHTML = message;
}

// Profile management functions
function loadProfile() {
    if (!currentUser) return;

    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'Administrator' : 'User';
    document.getElementById('profile-created').textContent = formatDate(currentUser.createdAt);

    // Show user management section for admins
    const userManagementSection = document.getElementById('user-management-section');
    if (currentUser.role === 'admin') {
        userManagementSection.style.display = 'block';
        loadUserList();
    } else {
        userManagementSection.style.display = 'none';
    }
}

function handleUsernameChange(e) {
    e.preventDefault();

    const newUsername = document.getElementById('new-username').value;
    const confirmPassword = document.getElementById('confirm-password-username').value;

    // Validate current password
    if (!authenticateUser(currentUser.username, confirmPassword)) {
        showNotification('Password salah!', 'error');
        return;
    }

    // Check if username already exists
    const users = getUsers();
    if (users.find(u => u.username === newUsername && u.id !== currentUser.id)) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    // Update username
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        saveUsers(users);
        currentUser.username = newUsername;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadProfile();
        showNotification('Username berhasil diubah!', 'success');
        document.getElementById('username-form').reset();
    }
}

function handlePasswordChange(e) {
    e.preventDefault();

    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate old password
    if (!authenticateUser(currentUser.username, oldPassword)) {
        showNotification('Password lama salah!', 'error');
        return;
    }

    // Validate new password
    if (newPassword.length < 6) {
        showNotification('Password baru minimal 6 karakter!', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('Konfirmasi password tidak cocok!', 'error');
        return;
    }

    // Update password
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = simpleHash(newPassword);
        saveUsers(users);
        showNotification('Password berhasil diubah!', 'success');
        document.getElementById('password-form').reset();
    }
}

function showAddUserModal() {
    if (currentUser.role !== 'admin') {
        showNotification('Akses ditolak!', 'error');
        return;
    }
    document.getElementById('add-user-modal').classList.remove('hidden');
}

function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.add('hidden');
    document.getElementById('add-user-form').reset();
}

function handleAddUser(e) {
    e.preventDefault();

    if (currentUser.role !== 'admin') {
        showNotification('Akses ditolak!', 'error');
        return;
    }

    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    // Validate password length
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }

    // Check if username already exists
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    // Add new user
    const newUser = {
        id: generateId(),
        username: username,
        password: simpleHash(password),
        role: role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    loadUserList();
    closeAddUserModal();
    showNotification('User berhasil ditambahkan!', 'success');
}

function loadUserList() {
    if (currentUser.role !== 'admin') return;

    const users = getUsers();
    const userList = document.getElementById('user-list');

    userList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <h4>${user.username}</h4>
                <p>Role: ${user.role === 'admin' ? 'Administrator' : 'User'} | Dibuat: ${formatDate(user.createdAt)}</p>
            </div>
            <div class="user-actions">
                ${user.id !== currentUser.id ? `
                    <button class="btn btn--outline btn--xs" onclick="deleteUser('${user.id}')">Hapus</button>
                ` : '<span class="current-user">User Saat Ini</span>'}
            </div>
        </div>
    `).join('');
}

function deleteUser(userId) {
    if (currentUser.role !== 'admin') {
        showNotification('Akses ditolak!', 'error');
        return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
        const users = getUsers().filter(u => u.id !== userId);
        saveUsers(users);
        loadUserList();
        showNotification('User berhasil dihapus!', 'success');
    }
}

// Role-based access control
function checkRoleAccess(feature) {
    if (!currentUser) return false;

    const rolePermissions = {
        admin: ['all'],
        user: ['view_customers', 'view_dashboard', 'view_analytics', 'view_reminders', 'edit_profile']
    };

    return rolePermissions[currentUser.role]?.includes('all') ||
           rolePermissions[currentUser.role]?.includes(feature);
}

function restrictFeatures() {
    // Hide admin-only features for regular users
    if (currentUser.role !== 'admin') {
        // Could hide certain menu items or buttons here if needed
    }
}

// Initialize charts on dashboard load
function initializeCharts() {
    if (document.getElementById('dashboard-page').classList.contains('active')) {
        setTimeout(() => {
            updateRegistrationChart();
            updateFrequentGuestsChart();
        }, 100);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification status--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1002;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Utility functions
function formatDate(dateString) {
    // If already in DD/MM/YYYY format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return dateString;
    }

    // Handle YYYY-MM-DD format
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    // Handle Date object or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
}