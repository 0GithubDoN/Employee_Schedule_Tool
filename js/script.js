// Global variables
let globalExcelData = null; // This will store the imported Excel data
let currentTheme = 'default'; // Default theme
let rowToDelete = null; // Store the row to be deleted
let firstRow = null; // Store the first row for combining

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    const rangeInput = document.querySelector('input[type="range"]');
    const rangeValue = document.querySelector('.range-value');

    function updateRangeValue() {
        const value = rangeInput.value;
        const max = rangeInput.max;
        const min = rangeInput.min;
        const percent = ((value - min) / (max - min)) * 100;
        
        // Update the value
        rangeValue.textContent = value;

        // Update the position
        rangeValue.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
    }

    rangeInput.addEventListener('input', updateRangeValue);
    rangeInput.addEventListener('change', updateRangeValue);

    updateRangeValue(); // Initialize on load

    // Existing initialization code
    loadTableFromLocal(); // Load table data from local storage
    setupEventListeners();
    enableRowDragAndDrop(); // Initialize drag-and-drop functionality
    applyTooltips(); // Apply tooltips to existing elements
    applyInteractiveFunctions();
    applyCellEventListeners(); // Apply event listeners to cells
    calculateTotalHours(); // Calculate total hours on page load
    normalizeAllCells(); // Normalize all cells on page load
    loadSelectedFontFromLocalStorage(); // Load the selected font from local storage
});

// Setup event listeners
function setupEventListeners() {
    document.querySelector("#menuToggleBtn").addEventListener("click", toggleMenu);
    document.getElementById("printBtn").addEventListener("click", printTable); // Updated this line to call printTable
    document.querySelector("#exportImageBtn").addEventListener("click", exportAsImage);
    document.querySelector("#exportPdfBtn").addEventListener("click", correctedExportAsPDF);
    document.querySelector("#convertPdfBtn").addEventListener("click", triggerPdfInput);
    document.querySelector("#pdfInput").addEventListener("change", processPDFtoXLSX);
    document.querySelector("#importXlsxBtn").addEventListener("click", triggerXlsxInput);
    document.querySelector("#xlsxInput").addEventListener("change", importXLSX);
    document.querySelector("#addEmployeeBtn").addEventListener("click", addEmployee);
    document.querySelector("#saveChangesBtn").addEventListener("click", function() {
        saveChanges();
        saveTableToLocal(); // Save table data to local storage
    });
    document.querySelector("#clearDataBtn").addEventListener("click", showClearDataConfirmation);
    document.querySelector("#confirmClearDataBtn").addEventListener("click", confirmClearData);
    document.querySelector("#searchInput").addEventListener("keyup", searchTable);
    document.querySelector("#theme-select").addEventListener("change", changeTheme);
    document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDeleteRow);
    document.getElementById("fontSelectionBtn").addEventListener("click", openFontSelectionPopup);

    document.querySelectorAll('.font-option').forEach(button => {
        button.addEventListener('click', function() {
            const selectedFont = this.getAttribute('data-font');
            applyFontToTable(selectedFont);
            closeFontSelectionPopup();
        });
    });

    document.addEventListener("click", function(event) {
        var menu = document.getElementById("menu");
        var menuContent = document.getElementById("menuContent");
        var isMenuClicked = menu.contains(event.target);
        if (!isMenuClicked) {
            menuContent.classList.remove("show");
        }
    });

    document.querySelector(".menu").addEventListener("mouseleave", function() {
        var menuContent = document.getElementById("menuContent");
        menuContent.classList.remove("show");
    });
}

// Function to apply tooltips to newly created elements
function applyTooltips() {
    const tooltipElements = document.querySelectorAll('.tooltip');
    tooltipElements.forEach(element => {
        const tooltipText = element.querySelector('.tooltiptext');
        element.onmouseenter = () => {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        };
        element.onmouseleave = () => {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        };
    });
}

// Toggle menu visibility
function toggleMenu() {
    var menuContent = document.getElementById("menuContent");
    menuContent.classList.toggle('show');
}

// Export as image
function exportAsImage() {
    document.querySelectorAll('.no-print, #theme-select').forEach(el => el.style.display = 'none');

    html2canvas(document.querySelector("#scheduleTable"), {
        useCORS: true,
        scale: 2,
        logging: true,
        width: document.querySelector("#scheduleTable").clientWidth,
        height: document.querySelector("#scheduleTable").clientHeight,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'schedule.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }).catch(error => {
        console.error('Error exporting image:', error);
        alert('Error exporting image. Please try again.');
    }).finally(() => {
        document.querySelectorAll('.no-print, #theme-select').forEach(el => el.style.display = '');
    });
}

// Export as PDF
function correctedExportAsPDF() {
    const table = document.querySelector("#scheduleTable");
    document.querySelectorAll('.no-print, #theme-select').forEach(element => {
        element.style.display = 'none';
    });

    html2canvas(table, {
        scale: 2,
        useCORS: true,
        onclone: (document) => {
            document.querySelector("#scheduleTable").style.width = `${table.offsetWidth}px`;
            document.querySelector("#scheduleTable").style.height = `${table.offsetHeight}px`;
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        const maxPdfWidth = 841.89;
        const maxPdfHeight = 595.28;
        let pdfWidth = canvas.width;
        let pdfHeight = canvas.height;

        if (pdfWidth > maxPdfWidth) {
            const ratio = maxPdfWidth / pdfWidth;
            pdfWidth = maxPdfWidth;
            pdfHeight *= ratio;
        }
        if (pdfHeight > maxPdfHeight) {
            const ratio = maxPdfHeight / pdfHeight;
            pdfHeight = maxPdfHeight;
            pdfWidth *= ratio;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
            unit: 'pt',
            format: [pdfWidth, pdfHeight]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('schedule.pdf');
    }).catch(error => {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    }).finally(() => {
        document.querySelectorAll('.no-print, #theme-select').forEach(element => {
            element.style.display = '';
        });
    });
}

// Trigger PDF input
function triggerPdfInput() {
    document.querySelector("#pdfInput").click();
}

// Trigger XLSX input
function triggerXlsxInput() {
    document.querySelector("#xlsxInput").click();
}

// Process PDF to XLSX using PDF.js
async function processPDFtoXLSX(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = async (e) => {
            try {
                console.log('FileReader has loaded the file.');
                const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) });
                const pdf = await loadingTask.promise;
                console.log(`PDF loaded with ${pdf.numPages} page(s).`);

                let pdfData = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    let pageItems = textContent.items;
                    let pageLines = [];
                    let currentLine = [];

                    let previousY = pageItems[0].transform[5];
                    for (let item of pageItems) {
                        let currentY = item.transform[5];
                        if (currentY !== previousY) {
                            pageLines.push(currentLine.join(' '));
                            currentLine = [];
                            previousY = currentY;
                        }
                        currentLine.push(item.str);
                    }
                    pageLines.push(currentLine.join(' '));
                    
                    pdfData.push(...pageLines.map(line => [line]));
                }

                console.log('Extracted text:', pdfData);
                convertTextToXLSX(pdfData);

            } catch (error) {
                console.error('Error processing PDF:', error);
                alert('Failed to process PDF. Please check the file format.');
            }
        };
        reader.onerror = (e) => {
            console.error('Error reading file:', e);
        };
        console.log('Starting file read process...');
        reader.readAsArrayBuffer(file);
    }
}

// Convert extracted PDF text to XLSX and download
function convertTextToXLSX(pdfData) {
    let worksheet = XLSX.utils.aoa_to_sheet(pdfData);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'converted_pdf.xlsx');
}

// Function to import XLSX data and apply event listeners
function importXLSX(event) {
    showLoadingAnimation();
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        globalExcelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Store in global variable

        const startIndexInput = document.getElementById('startIndex').value;
        const startIndex = parseInt(startIndexInput);

        if (isNaN(startIndex) || startIndex < 1 || startIndex > globalExcelData.length) {
            alert('Invalid start index. Please enter a valid number.');
            hideLoadingAnimation();
            return;
        }

        prepareMappingInterface(startIndex);
        document.getElementById("mapper-popup").style.display = "block";
        hideLoadingAnimation();
    };
    reader.readAsArrayBuffer(file);
}

// Prepare mapping interface
function prepareMappingInterface(startIndex) {
    const previewTable = document.getElementById("previewTable");
    if (!previewTable) {
        console.error("previewTable element not found");
        return;
    }

    const thead = previewTable.querySelector("thead");
    const tbody = previewTable.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headers = globalExcelData[startIndex - 1];
    console.log('Headers:', headers);

    const headerRow = document.createElement("tr");
    headers.forEach((header, index) => {
        const th = document.createElement("th");
        const select = document.createElement("select");
        select.className = 'mapping-dropdown';
        select.id = `column-${index}`;
        ['Ignore', 'Name', 'Job', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.toLowerCase();
            opt.innerHTML = option;
            select.appendChild(opt);
        });
        th.appendChild(select);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    for (let rowIndex = startIndex; rowIndex < globalExcelData.length; rowIndex++) {
        const excelRow = globalExcelData[rowIndex];
        const tr = document.createElement("tr");
        headers.forEach((header, index) => {
            const td = document.createElement("td");
            td.textContent = excelRow[index] || '';
            td.contentEditable = "true";
            td.addEventListener('blur', () => {
                globalExcelData[rowIndex][index] = td.textContent;
            });
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }

    document.getElementById("mapper-popup").style.display = "block";
}

// Close mapper popup
function closeMapperPopup() {
    var mapperPopup = document.getElementById("mapper-popup");
    mapperPopup.style.display = "none";
}

// Apply mappings
function applyMappings() {
    const table = document.querySelector("#scheduleTable");
    const mappings = {};
    const startIndex = parseInt(document.getElementById('startIndex').value);
    const headers = globalExcelData[startIndex - 1];

    headers.forEach((header, index) => {
        const dropdown = document.getElementById(`column-${index}`);
        if (dropdown && dropdown.value !== 'ignore') {
            mappings[dropdown.value] = index;
        }
    });

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (let rowIndex = startIndex; rowIndex < globalExcelData.length; rowIndex++) {
        const excelRow = globalExcelData[rowIndex];
        const tableRow = table.insertRow(-1);

        const nameCell = tableRow.insertCell(-1);
        nameCell.contentEditable = "true";
        nameCell.innerHTML = `<span class="combine-icon tooltip" onclick="combineRow(this)"><i class="fas fa-compress-arrows-alt"></i><span class="tooltiptext">Combine Row</span></span> ${excelRow[mappings['name']] || ''}`;

        ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
            const cell = tableRow.insertCell(-1);
            cell.contentEditable = "true";
            const dataIndex = mappings[day];
            if (dataIndex !== undefined) {
                cell.innerText = excelRow[dataIndex] || '';
            } else {
                cell.innerText = '';
            }
        });

        const actionCell = tableRow.insertCell(-1);
        actionCell.className = 'actions-cell no-print';
        actionCell.innerHTML = `
            <span class="tooltip">
                <button class="delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button>
                <span class="tooltiptext">Delete Row</span>
            </span>
            <span class="tooltip color-picker-icon" onclick="showColorPicker(this)">
                <input type="color" class="color-picker" onchange="setColorForRow(this);">
                <span class="tooltiptext">Pick Color</span>
            </span>`;

        const totalHoursCell = tableRow.insertCell(-1);
        totalHoursCell.className = 'total-hours';
        totalHoursCell.innerText = '0.00 hrs';
    }

    document.getElementById("mapper-popup").style.display = "none";
    applyTooltips(); // Apply tooltips to newly created elements
    applyInteractiveFunctions(); // Reapply interactive functions
    applyCellEventListeners(); // Apply event listeners to cells
    calculateTotalHours(); // Recalculate total hours
}

// Function to normalize time ranges
function normalizeTimeRanges(text) {
    return text.replace(/\s*-\s*/g, '-').replace(/\s*\/\s*/g, ' / ');
}

// Function to apply normalization to all contenteditable cells except for combine icons
function normalizeAllCells() {
    const table = document.querySelector("#scheduleTable");
    const cells = table.querySelectorAll("td[contenteditable='true']");

    cells.forEach(cell => {
        if (!cell.querySelector('.combine-icon')) {
            cell.innerText = normalizeTimeRanges(cell.innerText);
        } else {
            const textNode = cell.childNodes[1]; // Assumes the combine icon is the first child
            if (textNode) {
                textNode.nodeValue = normalizeTimeRanges(textNode.nodeValue);
            }
        }
    });
}


// Function to combine rows
function combineRow(button) {
    const row = button.closest('tr');
    if (!firstRow) {
        // First row selected
        firstRow = row;
        row.style.backgroundColor = '#d3d3d3'; // Highlight selected row
    } else {
        // Second row selected
        if (firstRow === row) {
            alert('Cannot combine the same row.');
            return;
        }
        // Combine rows
        const cells1 = firstRow.querySelectorAll('td[contenteditable="true"]');
        const cells2 = row.querySelectorAll('td[contenteditable="true"]');

        for (let i = 0; i < cells1.length; i++) {
            if (i === 0) {
                // Handle the first cell (name cell) separately
                const name1 = cells1[i].childNodes[1] ? cells1[i].childNodes[1].nodeValue.trim() : '';
                const name2 = cells2[i].childNodes[1] ? cells2[i].childNodes[1].nodeValue.trim() : '';
                if (name1 && name2) {
                    cells1[i].childNodes[1].nodeValue = `${name1} / ${name2}`;
                } else if (name2) {
                    cells1[i].childNodes[1].nodeValue = name2;
                }
            } else {
                // For other cells, only add a slash if both cells have content
                if (cells1[i].innerText.trim() && cells2[i].innerText.trim()) {
                    cells1[i].innerText += ' / ' + cells2[i].innerText;
                } else if (cells2[i].innerText.trim()) {
                    cells1[i].innerText = cells2[i].innerText;
                }
            }
            // Normalize the combined text
            cells1[i].innerText = normalizeTimeRanges(cells1[i].innerText);
            // Add combined-cell class to ensure proper styling
            cells1[i].classList.add('combined-cell');
        }
        // Remove the second row
        row.remove();
        firstRow.style.backgroundColor = ''; // Remove highlight
        firstRow = null;

        // Recalculate hours
        calculateTotalHours();
    }
}


// Ensure you call this function to apply the interactive functions after importing the data
function applyInteractiveFunctions() {
    document.querySelectorAll('.color-picker-icon').forEach(icon => {
        icon.onclick = () => showColorPicker(icon);
    });

    document.querySelectorAll('.combine-icon').forEach(icon => {
        icon.onclick = () => combineRow(icon);
    });

    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.onchange = () => setColorForRow(picker);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = () => showDeleteConfirmation(button);
    });
}


// Ensure you call this function to apply the interactive functions after importing the data
function applyInteractiveFunctions() {
    document.querySelectorAll('.color-picker-icon').forEach(icon => {
        icon.onclick = () => showColorPicker(icon);
    });

    document.querySelectorAll('.combine-icon').forEach(icon => {
        icon.onclick = () => combineRow(icon);
    });

    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.onchange = () => setColorForRow(picker);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = () => showDeleteConfirmation(button);
    });
}

// Change theme
function changeTheme() {
    const themeSelect = document.getElementById("theme-select");
    const selectedTheme = themeSelect.value;
    applyTheme(selectedTheme);
}

// Apply theme
function applyTheme(theme) {
    const table = document.querySelector("#scheduleTable");
    table.className = `table ${theme}`;
    currentTheme = theme;
}

// Function to add a new employee row and apply event listeners
function addEmployee() {
    const table = document.querySelector("#scheduleTable");
    const row = table.insertRow(-1);

    const nameCell = row.insertCell(-1);
    nameCell.contentEditable = "true";
    nameCell.innerHTML = `<span class="combine-icon tooltip" onclick="combineRow(this)"><i class="fas fa-compress-arrows-alt"></i><span class="tooltiptext">Combine Row</span></span> New Employee`;

    for (let i = 1; i <= 7; i++) {
        const cell = row.insertCell(-1);
        cell.contentEditable = "true";
        cell.innerText = "";
    }

    const actionCell = row.insertCell(-1);
    actionCell.className = 'actions-cell no-print';
    actionCell.innerHTML = `
        <span class="tooltip">
            <button class="delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button>
            <span class="tooltiptext">Delete Row</span>
        </span>
        <span class="tooltip color-picker-icon" onclick="showColorPicker(this)">
            <input type="color" class="color-picker" onchange="setColorForRow(this);">
            <span class="tooltiptext">Pick Color</span>
        </span>`;

    const totalHoursCell = row.insertCell(-1);
    totalHoursCell.className = 'total-hours';
    totalHoursCell.innerText = '0.00 hrs';

    applyTooltips(); // Apply tooltips to newly created elements
    applyInteractiveFunctions(); // Reapply interactive functions
    applyCellEventListeners(); // Apply event listeners to new row cells
    calculateTotalHours(); // Recalculate total hours
}

// Function to delete a row
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    saveTableToLocal();
    calculateTotalHours(); // Recalculate total hours
}

// Function to show delete confirmation popup
function showDeleteConfirmation(button) {
    rowToDelete = button.closest('tr');
    document.getElementById("deleteConfirmationPopup").style.display = "block";
}

// Function to close delete confirmation popup
function closeDeleteConfirmation() {
    document.getElementById("deleteConfirmationPopup").style.display = "none";
    rowToDelete = null;
}

// Function to confirm delete row
function confirmDeleteRow() {
    if (rowToDelete) {
        rowToDelete.remove();
        rowToDelete = null;
        closeDeleteConfirmation();
        // Do not save to local storage here
    }
}

// Clear local storage and reload the page
function clearLocalStorage() {
    if (confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) {
        localStorage.removeItem("tableData");
        window.location.reload();
    }
}

// Function to show the clear data confirmation popup
function showClearDataConfirmation() {
    var popup = document.getElementById("clearDataConfirmationPopup");
    popup.style.display = "block";
}

// Function to close the clear data confirmation popup
function closeClearDataConfirmation() {
    document.getElementById("clearDataConfirmationPopup").style.display = "none";
}

// Function to confirm clear data
function confirmClearData() {
    localStorage.removeItem("tableData");
    closeClearDataConfirmation();
    window.location.reload();
}

// Save changes to the server and local storage
function saveChanges() {
    var data = { employees: [] };
    var rows = document.querySelectorAll("#scheduleTable tr:not(:first-child)");
    rows.forEach(function(row) {
        var employee = {
            name: row.cells[0].textContent.replace("Combine Row", "").trim(),
            days: []
        };
        for (var i = 1; i < row.cells.length - 2; i++) {
            employee.days.push(row.cells[i].textContent.trim());
        }
        var colorPicker = row.cells[row.cells.length - 1].querySelector('.color-picker');
        if (colorPicker) {
            employee.color = colorPicker.value;
        } else {
            employee.color = '#ffffff'; // Default color if color picker is not found
        }
        data.employees.push(employee);
    });

    fetch('php/save_schedule.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showSaveConfirmation();
        saveTableToLocal(); // Save the table data to local storage
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving data!');
    });
}

// Function to show save confirmation popup
function showSaveConfirmation() {
    var popup = document.getElementById("saveConfirmationPopup");
    popup.style.display = "block";
    setTimeout(function() {
        popup.style.display = "none";
    }, 1000); // Automatically hide after 3 seconds
}

// Function to close save confirmation popup
function closeSaveConfirmation() {
    document.getElementById("saveConfirmationPopup").style.display = "none";
}


// Search table
function searchTable() {
    let input = document.querySelector("#searchInput");
    let filter = input.value.toUpperCase();
    let table = document.querySelector("#scheduleTable");
    let tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

// Function to show color picker
function showColorPicker(icon) {
    const colorPicker = icon.querySelector('.color-picker');
    if (colorPicker) {
        colorPicker.click();
    }
}

// Function to set color for row
function setColorForRow(picker) {
    let row = picker.closest('tr');
    let color = picker.value;
    let rgbaColor = hexToRGBA(color, 0.5);
    row.style.backgroundColor = rgbaColor;
    picker.style.visibility = 'hidden';
}

// Convert hex color to RGBA with specified opacity
function hexToRGBA(hex, opacity) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Show loading animation
function showLoadingAnimation() {
    document.getElementById('loadingOverlay').style.display = 'block';
}

// Hide loading animation
function hideLoadingAnimation() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Refresh page
function refreshPage() {
    window.location.reload();
}

// Enable drag-and-drop functionality for table cells
function enableDragAndDrop() {
    const cells = document.querySelectorAll("#scheduleTable td");

    cells.forEach(cell => {
        cell.draggable = true;

        cell.addEventListener("dragstart", () => {
            cell.classList.add("dragging");
        });

        cell.addEventListener("dragend", () => {
            cell.classList.remove("dragging");
        });

        cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector(".dragging");
            const isDraggingBefore = draggingElement.compareDocumentPosition(cell) & Node.DOCUMENT_POSITION_PRECEDING;
            const parent = cell.parentNode;

            if (isDraggingBefore) {
                parent.insertBefore(draggingElement, cell);
            } else {
                parent.insertBefore(draggingElement, cell.nextSibling);
            }
        });
    });
}

// Show mapper popup
function showMapperPopup() {
    document.getElementById("mapper-popup").style.display = "flex";
}

// Close mapper popup
function closeMapperPopup() {
    document.getElementById("mapper-popup").style.display = "none";
}

// Function to update the displayed range value
function updateStartIndex(value) {
    const startIndex = parseInt(value);
    const rangeValue = document.getElementById('startIndexValue');
    rangeValue.innerText = startIndex;
    console.log('Updated Start Index:', startIndex);

    if (isNaN(startIndex) || startIndex < 1 || startIndex > globalExcelData.length) {
        alert('Invalid start index. Please enter a valid number.');
        return;
    }

    prepareMappingInterface(startIndex);
}


// Enable drag-and-drop functionality for table rows
function enableRowDragAndDrop() {
    const table = document.querySelector("#scheduleTable");
    const rows = table.querySelectorAll("tbody tr");
    let draggingElement = null;
    let placeholder = document.createElement("tr");
    placeholder.className = "placeholder";
    let longPressTimer;
    const longPressDuration = 500; // 500ms long press

    rows.forEach((row) => {
        row.draggable = false; // Initially not draggable

        row.removeEventListener("mousedown", handleMouseDown);
        row.removeEventListener("mouseup", handleMouseUp);
        row.removeEventListener("mouseleave", handleMouseLeave);
        row.removeEventListener("dragstart", handleDragStart);
        row.removeEventListener("dragend", handleDragEnd);
        row.removeEventListener("dragover", handleDragOver);
        row.removeEventListener("drop", handleDrop);

        row.addEventListener("mousedown", handleMouseDown);
        row.addEventListener("mouseup", handleMouseUp);
        row.addEventListener("mouseleave", handleMouseLeave);
        row.addEventListener("dragstart", handleDragStart);
        row.addEventListener("dragend", handleDragEnd);
        row.addEventListener("dragover", handleDragOver);
        row.addEventListener("drop", handleDrop);
    });

    function handleMouseDown(e) {
        const targetRow = this;
        longPressTimer = setTimeout(() => {
            targetRow.draggable = true;
            targetRow.classList.add("draggable-row");
        }, longPressDuration);
    }

    function handleMouseUp() {
        clearTimeout(longPressTimer);
        this.draggable = false; // Reset draggable status
        this.classList.remove("draggable-row");
    }

    function handleMouseLeave() {
        clearTimeout(longPressTimer);
        this.draggable = false; // Reset draggable status
        this.classList.remove("draggable-row");
    }

    function handleDragStart(e) {
        if (!this.draggable) return;

        console.log('Drag start');
        draggingElement = this;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", this.innerHTML);
        this.classList.add("dragging");
        setTimeout(() => this.style.display = "none", 0);
    }

    function handleDragEnd() {
        console.log('Drag end');
        this.classList.remove("dragging");
        this.style.display = "table-row";
        if (placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        updateRowOrder();
        draggingElement = null;
        this.draggable = false; // Reset draggable status
        this.classList.remove("draggable-row");
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const target = e.target.closest("tr");
        if (target && target !== draggingElement && target.parentNode === table.tBodies[0]) {
            const rect = target.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const shouldInsertBefore = offset < rect.height / 2;
            table.tBodies[0].insertBefore(placeholder, shouldInsertBefore ? target : target.nextSibling);
        }
    }

    function handleDrop(e) {
        console.log('Drop');
        e.stopPropagation();
        e.preventDefault();

        if (draggingElement && placeholder.parentNode === table.tBodies[0]) {
            placeholder.parentNode.replaceChild(draggingElement, placeholder);
            updateRowOrder();
            draggingElement = null;
        }
    }
}

// Update row order after drag-and-drop
function updateRowOrder() {
    const table = document.querySelector("#scheduleTable");
    const rows = table.querySelectorAll("tbody tr");
    const newOrder = Array.from(rows).map((row, index) => {
        const cells = row.cells;
        return {
            index: index,
            name: cells[0] ? cells[0].textContent.trim() : '',
            days: Array.from(cells).slice(1, -1).map(cell => cell.textContent.trim())
        };
    });

    console.log("New Row Order:", newOrder);
}

// Save table data to local storage
function saveTableToLocal() {
    const table = document.querySelector("#scheduleTable");
    const rows = table.querySelectorAll("tr:not(:first-child)");
    let tableData = [];

    rows.forEach(row => {
        let rowData = [];
        const nameCell = row.querySelector("td:first-child");
        // Extract only the employee name, removing the combine icon text
        const employeeName = nameCell.textContent.replace("Combine Row", "").trim();
        rowData.push(employeeName);

        row.querySelectorAll("td").forEach((cell, index) => {
            if (index > 0 && index < row.cells.length - 2) { // Exclude the action and total hours cells
                rowData.push(cell.textContent.trim());
            }
        });
        tableData.push(rowData);
    });

    localStorage.setItem("tableData", JSON.stringify(tableData));
}

// Function to load table data from local storage and ensure combine icons are present
function loadTableFromLocal() {
    const tableData = JSON.parse(localStorage.getItem("tableData"));
    const table = document.querySelector("#scheduleTable");

    // Clear existing rows except for the header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    if (tableData && tableData.length > 0) {
        tableData.forEach(rowData => {
            let row = document.createElement("tr");

            let nameCell = document.createElement("td");
            nameCell.contentEditable = "true";
            nameCell.innerHTML = `<span class="combine-icon tooltip" onclick="combineRow(this)"><i class="fas fa-compress-arrows-alt"></i><span class="tooltiptext">Combine Row</span></span> ${rowData[0] || ''}`;
            row.appendChild(nameCell);

            rowData.slice(1).forEach(cellData => {
                let cell = document.createElement("td");
                cell.contentEditable = "true";
                cell.textContent = cellData;
                row.appendChild(cell);
            });

            let buttonCell = document.createElement("td");
            buttonCell.className = 'actions-cell no-print';
            buttonCell.innerHTML = `
                <span class="tooltip">
                    <button class="delete-btn" onclick="showDeleteConfirmation(this)"><i class="fas fa-trash"></i></button>
                    <span class="tooltiptext">Delete Row</span>
                </span>
                <span class="tooltip color-picker-icon" onclick="showColorPicker(this)">
                    <input type="color" class="color-picker" onchange="setColorForRow(this);">
                    <span class="tooltiptext">Pick Color</span>
                </span>`;
            row.appendChild(buttonCell);

            const totalHoursCell = document.createElement('td');
            totalHoursCell.className = 'total-hours';
            totalHoursCell.innerText = '0.00 hrs';
            row.appendChild(totalHoursCell);

            table.appendChild(row);
        });

        applyTooltips(); // Apply tooltips to elements loaded from local storage
        applyInteractiveFunctions(); // Reapply interactive functions
        applyCellEventListeners(); // Apply event listeners to cells
        calculateTotalHours(); // Calculate total hours
        normalizeAllCells(); // Normalize all cells
    } else {
        // Optional: Initialize with default rows if no data in local storage
        for (let i = 1; i <= 5; i++) {
            let row = document.createElement("tr");

            let nameCell = document.createElement("td");
            nameCell.contentEditable = "true";
            nameCell.innerHTML = `<span class="combine-icon tooltip" onclick="combineRow(this)"><i class="fas fa-compress-arrows-alt"></i><span class="tooltiptext">Combine Row</span></span> Employee ${i}`;
            row.appendChild(nameCell);

            for (let j = 1; j <= 7; j++) {
                let cell = document.createElement("td");
                cell.contentEditable = "true";
                row.appendChild(cell);
            }

            let buttonCell = document.createElement("td");
            buttonCell.className = 'actions-cell no-print';
            buttonCell.innerHTML = `
                <span class="tooltip">
                    <button class="delete-btn" onclick="showDeleteConfirmation(this)"><i class="fas fa-trash"></i></button>
                    <span class="tooltiptext">Delete Row</span>
                </span>
                <span class="tooltip color-picker-icon" onclick="showColorPicker(this)">
                    <input type="color" class="color-picker" onchange="setColorForRow(this);">
                    <span class="tooltiptext">Pick Color</span>
                </span>`;
            row.appendChild(buttonCell);

            const totalHoursCell = document.createElement('td');
            totalHoursCell.className = 'total-hours';
            totalHoursCell.innerText = '0.00 hrs';
            row.appendChild(totalHoursCell);

            table.appendChild(row);
        }

        applyTooltips(); // Apply tooltips to elements loaded from local storage
        applyInteractiveFunctions(); // Reapply interactive functions
    }
}


// Update data from cell
function updateDataFromCell(cell) {
    const row = cell.parentElement;
    const rowIndex = row.rowIndex - 1;
    const colIndex = cell.cellIndex;
    
    globalExcelData[rowIndex][colIndex] = cell.innerText;
}

// Helper function to parse time strings
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
}

// Helper function to calculate hours worked from a time range
function calculateHours(timeRange) {
    const timeRangePattern = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
    const match = timeRangePattern.exec(timeRange.replace(/\s/g, ''));
    if (!match) return 0; // Ensure the range matches the pattern
    const [_, start, end] = match.map(parseTime);
    return end - start;
}

// Function to calculate total working hours for each employee
function calculateTotalHours() {
    const table = document.querySelector("#scheduleTable");
    const rows = table.querySelectorAll("tr:not(:first-child)");

    rows.forEach(row => {
        let totalHours = 0;
        const cells = row.querySelectorAll("td");

        cells.forEach((cell, index) => {
            if (index > 0 && index < cells.length - 2) { // Ignore the name and action cells
                const timeRanges = cell.innerText.split(/\s*\/\s*/); // Split on " / " or "/"
                timeRanges.forEach(range => {
                    totalHours += calculateHours(range.trim());
                });
            }
        });

        // Update or create the total hours cell
        let totalCell = row.querySelector('.total-hours');
        if (!totalCell) {
            totalCell = document.createElement('td');
            totalCell.className = 'total-hours';
            row.appendChild(totalCell);
        }
        totalCell.innerText = isNaN(totalHours) ? '0.00 hrs' : totalHours.toFixed(2) + ' hrs';
    });
}

// Function to apply event listeners to editable cells for real-time updates
function applyCellEventListeners() {
    const table = document.querySelector("#scheduleTable");
    const cells = table.querySelectorAll("td[contenteditable='true']");

    cells.forEach(cell => {
        cell.addEventListener('input', () => {
            calculateTotalHours(); // Recalculate total hours on cell input
        });

        cell.addEventListener('blur', () => {
            calculateTotalHours(); // Recalculate total hours when cell loses focus
        });
    });
}

// Function to open the font selection popup
function openFontSelectionPopup() {
    closeAllPopups(); // Close all other popups
    document.getElementById('fontSelectionPopup').style.display = 'flex'; // Use 'flex' to center the popup
}

// Function to close the font selection popup
function closeFontSelectionPopup() {
    document.getElementById('fontSelectionPopup').style.display = 'none';
}

// Function to close the delete confirmation popup
function closeDeleteConfirmation() {
    document.getElementById("deleteConfirmationPopup").style.display = 'none';
}

// Function to close all popups
function closeAllPopups() {
    const popups = document.querySelectorAll('.confirmation-popup, .font-popup');
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
}

// Function to apply the selected font to the table
function applyFontToTable(font) {
    const table = document.getElementById('scheduleTable');
    table.style.fontFamily = font;
    saveSelectedFontToLocalStorage(font); // Save the selected font to local storage
}

// Function to save the selected font to local storage
function saveSelectedFontToLocalStorage(font) {
    localStorage.setItem('selectedFont', font);
}

// Function to load the selected font from local storage on page load
function loadSelectedFontFromLocalStorage() {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        applyFontToTable(savedFont);
    }
}