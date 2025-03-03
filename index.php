<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Schedule</title>

    <!-- External Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.2.146/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.2.146/pdf.worker.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    
    <!-- Local Styles -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/print.css">
    <link rel="stylesheet" href="css/themes.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css">
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="images/favicon.ico">
	<?php include 'php/fonts.php'; ?>
</head>
<body>
    <!-- Loading overlay -->
    <div id="loadingOverlay">
        <div class="loader"></div>
    </div>

    <!-- Logo -->
    <div class="logo-container">
        <a href="#" onclick="refreshPage()">
            <img src="images/logo.png" alt="Work Schedule Tool Logo" class="logo">
        </a>
    </div>
    
    <div class="container">
        <!-- Top Right Buttons -->
        <div class="top-right-buttons">
            <button id="importXlsxBtn" class="special-button">Import Data from Excel</button>
            <button id="printBtn" class="button"><i class="fas fa-print"></i> Print</button>
        </div>
        
        <!-- Search Box -->
        <div class="search-container no-print">
            <input type="text" id="searchInput" placeholder="Search for names..." class="search-input">
        </div>
        
        <!-- Title -->
        <h1 class="no-print">Employee Schedule</h1>
                
        <!-- Table Theme Selector -->
        <div class="theme-selector">
            <label for="theme-select">Select Table Theme:</label>
            <select id="theme-select">
                <option value="elegant">Elegant Theme</option>
                <option value="rainbow">Rainbow Theme</option>
                <option value="colorful">Colorful Theme</option>
                <option value="futuristic">Futuristic Theme</option>
                <option value="ai">AI Theme</option>
                <option value="google-calendar">Google Calendar Theme</option>
                <option value="modern">Modern Theme</option>
                <option value="default" selected>Default Theme</option>
            </select>
        </div>
        
        <!-- Menu -->
        <nav class="menu" id="menu">
            <button id="menuToggleBtn" class="menu-toggle">Menu</button>
            <div class="menu-content" id="menuContent">
                <button id="exportImageBtn" class="button"><i class="fas fa-image"></i> Export as Image</button>
                <button id="exportPdfBtn" class="button"><i class="fas fa-file-pdf"></i> Export as PDF</button>
                <button id="convertPdfBtn" class="button"><i class="fas fa-file-excel"></i> Convert PDF to XLSX</button>
				<button id="fontSelectionBtn" class="button"><i class="fas fa-font"></i> Select Font</button>				
            </div>
        </nav>
        
        <!-- Schedule Display -->
        <?php include 'php/schedule.php'; ?>
		<?php include 'php/fonts.php'; ?>
        
        <!-- File Inputs -->
        <input type="file" id="xlsxInput" accept=".xlsx" style="display: none;">
        <input type="file" id="pdfInput" accept=".pdf" style="display: none;">
        
        <!-- Additional Buttons -->
        <div class="buttons-container">
            <button id="addEmployeeBtn" class="button"><i class="fas fa-user-plus"></i> Add Employee</button>
            <button id="saveChangesBtn" class="button"><i class="fas fa-save"></i> Save Changes</button>
            <button id="clearDataBtn" class="button"><i class="fas fa-trash-alt"></i> Clear Data</button>
        </div>
    </div>

    <!-- Mapper Popup -->
    <div id="mapper-popup" class="mapper-popup" style="display:none;">
        <div class="mapper-content">
            <span class="close-btn" onclick="closeMapperPopup()">&times;</span>
            <h2>Assign Data Positions</h2>
            <label for="startIndex" class="slider-label">Start Position:</label>
            <div class="slider-container">
                <input type="range" id="startIndex" name="startIndex" min="1" max="10" value="6" oninput="updateStartIndex(this.value)">
                <span id="startIndexValue" class="range-value">6</span>
            </div>
            <button class="apply-button" onclick="applyMappings()">Apply Data Positions</button>
            <div id="preview-container">
                <h3>Preview</h3>
                <table id="previewTable" class="table">
                    <thead>
                        <!-- Dynamic content will be injected here -->
                    </thead>
                    <tbody>
                        <!-- Dynamic content will be injected here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

	<!-- Delete Confirmation Popup -->
	<div id="deleteConfirmationPopup" class="confirmation-popup" style="display: none;">
		<div class="popup-content">
			<span class="close-btn" onclick="closeDeleteConfirmation()">&times;</span>
			<h2>Confirm Deletion</h2>
			<p>Are you sure you want to delete this employee?</p>
			<div class="popup-buttons">
				<button id="confirmDeleteBtn" class="button">Yes</button>
				<button class="button" onclick="closeDeleteConfirmation()">No</button>
			</div>
		</div>
	</div>

    <!-- Save Confirmation Popup -->
    <div id="saveConfirmationPopup" class="confirmation-popup" style="display:none;">
        <div class="popup-content">
            <span class="close-btn" onclick="closeSaveConfirmation()">&times;</span>
            <h2>Success</h2>
            <p>Data saved successfully!</p>
        </div>
    </div>

    <!-- Clear Data Confirmation Popup -->
    <div id="clearDataConfirmationPopup" class="confirmation-popup">
        <div class="popup-content">
            <span class="close-btn" onclick="closeClearDataConfirmation()">&times;</span>
            <h2>Clear Data</h2>
            <p>Are you sure you want to clear all data? This action cannot be undone.</p>
            <div class="popup-buttons">
                <button id="confirmClearDataBtn" class="button">Yes</button>
                <button class="button" onclick="closeClearDataConfirmation()">No</button>
            </div>
        </div>
    </div>
    <!-- Footer -->
    <footer>
        <p>Please be advised that this is a BETA version. Kindly verify the data before exporting. Copyright © George Lucian.</p>
    </footer>
    <a href="php/documentation.html" class="go-to-doc">
        <button>Go to Documentation</button>
    </a>

    <!-- Local JavaScript Libraries -->
    <script src="js/jspdf.umd.min.js"></script>
    <script src="js/html2canvas.min.js"></script>
    <script src="js/draggable.js"></script> <!-- Custom JavaScript for draggable functionality -->
    <script src="js/resizable.js"></script> <!-- Custom JavaScript for resizable functionality -->
    <script src="js/script.js"></script> <!-- Your existing JavaScript file -->
    <script src="js/print.js"></script> <!-- Print Function -->
</body>
</html>
