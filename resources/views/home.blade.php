    @extends('layouts.app')

    @section('content')
    <!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Manajemen Customer Hotel</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
</head>
<body>
    <!-- Login Page -->
    <div id="login-page" class="login-page">
        <div class="login-container">
            <div class="login-header">
                <h1>Hotel Admin Login</h1>
                <p>Masuk ke sistem manajemen customer hotel</p>
            </div>
            <form id="login-form" class="login-form">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" id="login-username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" id="login-password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn--primary btn--full-width">Login</button>
            </form>
            <div class="login-footer">
                <p>Sistem Manajemen Customer Hotel</p>
            </div>
        </div>
    </div>

    <div class="app">
        <!-- Navigation -->
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <h2>Hotel Admin</h2>
                </div>
                <ul class="nav-menu">
                    <li><a href="#" onclick="showPage('dashboard')" class="nav-link active">Dashboard</a></li>
                    <li><a href="#" onclick="showPage('customers')" class="nav-link">Kelola Customer</a></li>
                    <li><a href="#" onclick="showPage('reminders')" class="nav-link">Pengingat Ulang Tahun</a></li>
                    <li><a href="#" onclick="showPage('analytics')" class="nav-link">Analitik</a></li>
                    <li><a href="#" onclick="showPage('profile')" class="nav-link">Profil</a></li>
                    <li><a href="#" onclick="logout()" class="nav-link logout-link">Logout</a></li>
                </ul>
            </div>
        </nav>

        <!-- Dashboard Page -->
        <div id="dashboard-page" class="page active">
            <div class="container">
                <div class="page-header">
                    <h1>Dashboard Admin</h1>
                    <p>Selamat datang di sistem manajemen customer hotel</p>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <h3 id="total-customers">0</h3>
                            <p>Total Customer</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎂</div>
                        <div class="stat-content">
                            <h3 id="birthdays-this-month">0</h3>
                            <p>Ulang Tahun Bulan Ini</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <h3 id="frequent-guests">0</h3>
                            <p>Tamu Setia (5+ menginap)</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <h3 id="new-customers-month">0</h3>
                            <p>Customer Baru Bulan Ini</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏙️</div>
                        <div class="stat-content">
                            <h3 id="top-city">-</h3>
                            <p>Kota Terpopuler</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3>Aksi Cepat</h3>
                    <div class="actions-grid">
                        <button class="btn btn--primary" onclick="showPage('customers')">
                            Tambah Customer Baru
                        </button>
                        <button class="btn btn--secondary" onclick="showPage('customers')">
                            Lihat Semua Customer
                        </button>
                        <button class="btn btn--secondary" onclick="showPage('reminders')">
                            Pengingat Ulang Tahun
                        </button>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-section">
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <h3>Tren Registrasi Customer</h3>
                        <canvas id="registrationChart"></canvas>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <h3>Top 10 Tamu Setia</h3>
                        <canvas id="frequentGuestsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Customers Management Page -->
        <div id="customers-page" class="page">
            <div class="container">
                <div class="page-header">
                    <h1>Kelola Customer</h1>
                    <div class="page-actions">
                        <button class="btn btn--primary" onclick="showAddCustomerForm()">Tambah Customer</button>
                        <button class="btn btn--secondary" onclick="showImportModal()">Import dari CSV</button>
                    </div>
                </div>

                <!-- Search and Filter -->
                <div class="search-section">
                    <input type="text" id="search-input" class="form-control" placeholder="Cari customer..." onkeyup="searchCustomers()">
                    <select id="filter-stays" class="form-control" onchange="filterCustomers()">
                        <option value="">Semua Customer</option>
                        <option value="frequent">Tamu Setia (5+ menginap)</option>
                        <option value="new">Customer Baru</option>
                    </select>
                </div>

                <!-- Customer List -->
                <div class="customer-list">
                    <div id="admin-notice" class="admin-notice" style="display: none;">
                        <div class="admin-notice-content">
                            <i class="admin-icon">🔒</i>
                            <span>Hapus customer hanya dapat dilakukan oleh Administrator</span>
                        </div>
                    </div>
                    <table class="customer-table" id="customer-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>Kota</th>
                                <th>Kamar</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>No. HP</th>
                                <th>Tanggal Lahir</th>
                                <th>Jumlah Menginap</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="customer-table-body">
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-section" id="pagination-section">
                    <div class="pagination-info">
                        <span id="pagination-info">Menampilkan 0 dari 0 customer</span>
                    </div>
                    <div class="pagination-controls">
                        <button class="btn btn--outline btn--sm" id="prev-page" onclick="changePage(-1)" disabled>Sebelumnya</button>
                        <span class="pagination-pages" id="pagination-pages"></span>
                        <button class="btn btn--outline btn--sm" id="next-page" onclick="changePage(1)" disabled>Selanjutnya</button>
                    </div>
                </div>

                <!-- Export Button -->
                <div class="export-section">
                    <button class="btn btn--secondary" onclick="exportToCSV()">Export ke CSV</button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Customer Modal -->
        <div id="customer-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Tambah Customer</h3>
                    <button class="modal-close" onclick="closeCustomerModal()">&times;</button>
                </div>
                <form id="customer-form" class="customer-form">
                    <div class="form-section">
                        <h4>Informasi Customer</h4>
                        <div class="form-group">
                            <label class="form-label">Nama Lengkap*</label>
                            <input type="text" id="customer-nama" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="customer-email" class="form-control">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Alamat*</label>
                                <textarea id="customer-alamat" class="form-control" rows="2" required></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kota*</label>
                                <input type="text" id="customer-kota" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">No. HP*</label>
                            <input type="tel" id="customer-noHp" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tanggal Lahir*</label>
                            <input type="date" id="customer-tanggalLahir" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Jumlah Menginap</label>
                            <input type="number" id="customer-jumlahMenginap" class="form-control" value="0" min="0">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Kamar</label>
                                <input type="text" id="customer-kamar" class="form-control" placeholder="Nomor kamar">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Pekerjaan</label>
                                <input type="text" id="customer-pekerjaan" class="form-control" placeholder="Pekerjaan">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipe ID</label>
                                <select id="customer-idType" class="form-control">
                                    <option value="KTP">KTP</option>
                                    <option value="SIM">SIM</option>
                                    <option value="Passport">Passport</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nomor ID</label>
                                <input type="text" id="customer-idNumber" class="form-control" placeholder="Nomor ID">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tanggal Check-in</label>
                                <input type="date" id="customer-checkinDate" class="form-control">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tanggal Check-out</label>
                                <input type="date" id="customer-checkoutDate" class="form-control">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Jam Check-in</label>
                                <input type="time" id="customer-checkinTime" class="form-control">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Jam Check-out</label>
                                <input type="time" id="customer-checkoutTime" class="form-control">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="customer-isReturningGuest"> Tamu Lama (Sudah pernah menginap sebelumnya)
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Upload KTP</h4>
                        <div class="ktp-upload-section">
                            <div class="file-input-group">
                                <input type="file" id="ktp-file" accept="image/*" onchange="handleKtpUpload(event)" style="display: none;">
                                <button type="button" class="btn btn--secondary" onclick="document.getElementById('ktp-file').click()">
                                    <span class="btn-icon">📁</span>
                                    Pilih File KTP
                                </button>
                                <span class="file-info" id="file-info">Belum ada file dipilih</span>
                            </div>

                            <div class="upload-area" id="upload-area">
                                <div class="upload-placeholder">
                                    <div class="upload-icon">📷</div>
                                    <p><strong>Drag & drop file KTP di sini</strong></p>
                                    <p>atau klik area ini untuk memilih file</p>
                                    <small>Format: JPG, PNG, maksimal 5MB</small>
                                </div>
                                <div class="upload-preview hidden" id="upload-preview">
                                    <img id="ktp-preview" alt="Preview KTP">
                                    <div class="preview-actions">
                                        <button type="button" class="btn btn--outline btn--sm" onclick="processOCRAutomatic()">
                                            <span class="btn-icon">🔄</span>
                                            Proses Ulang OCR
                                        </button>
                                        <button type="button" class="btn btn--outline btn--sm" onclick="clearKtpUpload()">
                                            <span class="btn-icon">🗑️</span>
                                            Hapus File
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="ocr-status" id="ocr-status"></div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn--secondary" onclick="closeCustomerModal()">Batal</button>
                        <button type="submit" class="btn btn--primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Birthday Reminders Page -->
        <div id="reminders-page" class="page">
            <div class="container">
                <div class="page-header">
                    <h1>Pengingat Ulang Tahun</h1>
                </div>

                <div class="reminders-section">
                    <div class="today-birthdays">
                        <h3>Ulang Tahun Hari Ini</h3>
                        <div id="today-birthdays-list" class="birthday-list"></div>
                    </div>

                    <div class="upcoming-birthdays">
                        <h3>Ulang Tahun 7 Hari Ke Depan</h3>
                        <div id="upcoming-birthdays-list" class="birthday-list"></div>
                    </div>

                    <div class="monthly-calendar">
                        <h3>Kalender Ulang Tahun Bulan Ini</h3>
                        <div id="birthday-calendar" class="calendar-view"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analytics Page -->
        <div id="analytics-page" class="page">
            <div class="container">
                <div class="page-header">
                    <h1>Analitik Customer</h1>
                </div>

                <div class="analytics-content">
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <h3>Demografi Usia Customer</h3>
                        <canvas id="ageChart"></canvas>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <h3>Distribusi Ulang Tahun per Bulan</h3>
                        <canvas id="birthdayChart"></canvas>
                    </div>
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <h3>Distribusi Customer per Kota</h3>
                        <canvas id="cityChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Page -->
        <div id="profile-page" class="page">
            <div class="container">
                <div class="page-header">
                    <h1>Pengaturan Profil</h1>
                    <p>Kelola informasi akun dan kata sandi Anda</p>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        <h3>Informasi Akun</h3>
                        <div class="profile-info">
                            <div class="info-item">
                                <label>Username:</label>
                                <span id="profile-username">-</span>
                            </div>
                            <div class="info-item">
                                <label>Role:</label>
                                <span id="profile-role">-</span>
                            </div>
                            <div class="info-item">
                                <label>Tanggal Dibuat:</label>
                                <span id="profile-created">-</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>Ubah Username</h3>
                        <form id="username-form" class="profile-form">
                            <div class="form-group">
                                <label class="form-label">Username Baru</label>
                                <input type="text" id="new-username" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Konfirmasi Password</label>
                                <input type="password" id="confirm-password-username" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn--primary">Ubah Username</button>
                        </form>
                    </div>

                    <div class="profile-section">
                        <h3>Ubah Password</h3>
                        <form id="password-form" class="profile-form">
                            <div class="form-group">
                                <label class="form-label">Password Lama</label>
                                <input type="password" id="old-password" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password Baru</label>
                                <input type="password" id="new-password" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Konfirmasi Password Baru</label>
                                <input type="password" id="confirm-password" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn--primary">Ubah Password</button>
                        </form>
                    </div>

                    <div class="profile-section" id="user-management-section" style="display: none;">
                        <h3>Kelola Pengguna</h3>
                        <div class="user-management">
                            <button class="btn btn--secondary" onclick="showAddUserModal()">Tambah User Baru</button>
                            <div class="user-list" id="user-list">
                                <!-- User list will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div id="delete-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Konfirmasi Hapus</h3>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin menghapus customer ini?</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn--secondary" onclick="closeDeleteModal()">Batal</button>
                    <button class="btn btn--primary" onclick="confirmDelete()">Hapus</button>
                </div>
            </div>
        </div>

        <!-- Import CSV Modal -->
        <div id="import-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Import Customer dari CSV</h3>
                    <button class="modal-close" onclick="closeImportModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-section">
                        <div class="form-group">
                            <label class="form-label">Pilih File CSV</label>
                            <input type="file" id="csv-file" accept=".csv" class="form-control">
                            <small class="form-help">File CSV harus memiliki header yang sesuai dengan format sistem</small>
                        </div>

                        <div class="csv-format-info">
                            <h4>Format CSV yang Diharapkan:</h4>
                            <div class="format-example">
                                <code>Nama,Email,Alamat,Kota,No HP,Tanggal Lahir,Jumlah Menginap,Kamar,Pekerjaan,Tipe ID,Nomor ID,Tanggal Check-in,Tanggal Check-out,Jam Check-in,Jam Check-out,Tamu Lama,Tanggal Dibuat</code>
                            </div>
                            <p><strong>Catatan:</strong></p>
                            <ul>
                                <li>Header harus dalam bahasa Indonesia atau sesuai dengan contoh di atas</li>
                                <li><strong>Wajib:</strong> Nama, Alamat</li>
                                <li><strong>Opsional:</strong> Email, Kota, No HP, dll.</li>
                                <li>Kolom "Tamu Lama" harus berisi "Ya" atau "Tidak"</li>
                                <li>Tanggal harus dalam format DD/MM/YYYY</li>
                                <li>Data yang tidak lengkap akan menggunakan nilai default</li>
                            </ul>
                        </div>

                        <div class="import-preview hidden" id="import-preview">
                            <h4>Pratinjau Data:</h4>
                            <div class="preview-table-container">
                                <table class="preview-table" id="preview-table"></table>
                            </div>
                        </div>

                        <div class="import-status" id="import-status"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn--secondary" onclick="closeImportModal()">Batal</button>
                    <button class="btn btn--outline" id="preview-btn" onclick="previewCSV()" disabled>Pratinjau</button>
                    <button class="btn btn--primary" id="import-btn" onclick="importCSV()" disabled>Import Data</button>
                </div>
            </div>
        </div>

        <!-- Add User Modal -->
        <div id="add-user-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Tambah User Baru</h3>
                    <button class="modal-close" onclick="closeAddUserModal()">&times;</button>
                </div>
                <form id="add-user-form" class="user-form">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="user-username" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="user-password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <select id="user-role" class="form-control" required>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn--secondary" onclick="closeAddUserModal()">Batal</button>
                        <button type="submit" class="btn btn--primary">Tambah User</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
    @endsection
