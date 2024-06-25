function printTable() {
    const tableContainer = document.querySelector('.table-container');
    const originalContent = document.body.innerHTML;
    const printContent = tableContainer.innerHTML;
    const currentTheme = document.querySelector('#scheduleTable').className; // Capture current theme
    const currentFont = window.getComputedStyle(document.querySelector('#scheduleTable')).fontFamily; // Capture current font

    const themeStyles = `
        <style>
            /* Elegant Theme */
            table.elegant {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                border-radius: 10px;
                overflow: hidden;
                font-family: "Georgia", serif;
                color: #333;
                background-color: #f7f7f7;
                border: 1px solid black !important;
            }
            table.elegant th, table.elegant td {
                padding: 15px;
                text-align: center;
                border: 1px solid #ddd;
            }
            table.elegant th {
                background-color: #4b4b4b;
                color: #000 !important;
                font-weight: bold;
            }
            table.elegant tr:nth-child(odd) {
                background-color: #ffffff;
            }
            table.elegant tr:nth-child(even) {
                background-color: #eeeeee;
            }
            table.elegant tr:hover {
                background-color: #cccccc;
            }

            /* Rainbow Theme */
            table.rainbow {
                width: 100%;
                border-collapse: collapse;
                border-radius: 12px;
                overflow: hidden;
                background-color: #ffffff;
                color: #333;
                border: 1px solid #ccc;
            }
            table.rainbow th, table.rainbow td {
                padding: 15px;
                text-align: center;
                border: 1px solid #ccc;
            }
            table.rainbow th {
                background-color: #ff6f61;
                color: #000 !important;
                font-weight: bold;
            }
            table.rainbow tr:nth-child(odd) {
                background-color: #ff6f61;
                color: white;
            }
            table.rainbow tr:nth-child(even) {
                background-color: #ffb86c;
                color: white;
            }
            table.rainbow tr:hover {
                background-color: #ddd;
            }

            /* Colorful Theme */
            table.colorful {
                width: 100%;
                border-collapse: collapse;
                border-radius: 10px;
                overflow: hidden;
            }
            table.colorful th, table.colorful td {
                padding: 15px;
                text-align: center;
                border: 1px solid #333;
            }
            table.colorful th {
                background-color: #ff5733;
                color: #000 !important;
                font-weight: bold;
            }
            table.colorful tr:nth-child(odd) {
                background-color: #33ffbd;
                color: #333;
            }
            table.colorful tr:nth-child(even) {
                background-color: #ff33a6;
                color: #333;
            }
            table.colorful tr:hover {
                background-color: #f0e68c;
            }

            /* Futuristic Theme */
            table.futuristic {
                width: 100%;
                border-collapse: collapse;
                border-radius: 8px;
                overflow: hidden;
                background-color: #e0f7fa;
                color: #1b262c;
                border: 2px solid #00acc1;
            }
            table.futuristic th, table.futuristic td {
                padding: 15px;
                text-align: center;
                border: 1px solid #00acc1;
                color: #1b262c;
            }
            table.futuristic th {
                background-color: #00acc1;
                color: #000 !important;
                font-weight: bold;
            }
            table.futuristic tr:nth-child(even) {
                background-color: #b2ebf2;
                color: #1b262c;
            }
            table.futuristic tr:nth-child(odd) {
                background-color: #e0f7fa;
                color: #1b262c;
            }
            table.futuristic tr:hover {
                background-color: #4dd0e1;
                color: white;
            }

            /* AI Theme */
            table.ai {
                width: 100%;
                border-collapse: collapse;
                border-radius: 8px;
                overflow: hidden;
                background-color: #ecf0f1;
                border: 2px solid #3498db;
            }
            table.ai th, table.ai td {
                padding: 15px;
                text-align: center;
                border: 1px solid #3498db;
            }
            table.ai th {
                background-color: #3498db;
                color: #000 !important;
                font-weight: bold;
            }
            table.ai tr:nth-child(even) {
                background-color: #d0e1f9;
            }
            table.ai tr:hover {
                background-color: #a9cce3;
            }

            /* Google Calendar Theme */
            table.google-calendar {
                width: 100%;
                border-collapse: collapse;
                border-radius: 8px;
                overflow: hidden;
                background-color: #ffffff;
                border: 2px solid #e0e0e0;
            }
            table.google-calendar th, table.google-calendar td {
                padding: 15px;
                text-align: left;
                border: 1px solid #dee2e6;
                font-family: Arial, sans-serif;
                font-size: 14px;
            }
            table.google-calendar th {
                background-color: #4285f4;
                color: #000 !important;
                font-weight: bold;
            }
            table.google-calendar tr:nth-child(even) {
                background-color: #f1f3f4;
            }
            table.google-calendar tr:hover {
                background-color: #e8eaed;
            }

            /* Modern Theme */
            table.modern {
                width: 100%;
                border-collapse: collapse;
                border-radius: 12px;
                overflow: hidden;
                background-color: #f8f9fa;
                border: 2px solid #2e86de;
            }
            table.modern th, table.modern td {
                padding: 15px;
                text-align: center;
                border: 1px solid #dee2e6;
            }
            table.modern th {
                background-color: #2e86de;
                color: #000 !important;
                font-weight: bold;
            }
            table.modern tr:nth-child(even) {
                background-color: #eaf1f8;
            }
            table.modern tr:hover {
                background-color: #d4e3f5;
            }
        </style>
    `;

    const printStyles = `
        <style>
            @media print {
                body, .container, .table-container {
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                }

                .no-print, .buttons-container, .top-right-buttons, .search-container, .logo-container, .theme-selector, .menu, footer, .go-to-doc, .combine-icon, h1 {
                    display: none !important;
                }

                .table-container {
                    width: 100% !important;
                    overflow: hidden !important;
                }

                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 0 !important;
                    border: 1px solid black !important; /* Ensure the table itself has a border */
                    font-family: ${currentFont} !important; /* Apply the current font */
                }

                th, td {
                    padding: 10px !important; /* Adjust padding if necessary */
                    text-align: center !important;
                    border: 1px solid black !important;
                    vertical-align: top !important;
                    word-wrap: break-word !important;
                    white-space: normal !important;
                    box-sizing: border-box !important;
                }

                th {
                    background-color: #f2f2f2 !important;
                    font-weight: bold !important;
                    border: 1px solid black !important;
                    color: #000 !important; /* Ensure black text for week day names */
                }

                td {
                    border: 1px solid black !important;
                }

                tr:nth-child(even) {
                    background-color: #f9f9f9 !important;
                }

                tr:nth-child(odd) {
                    background-color: #fff !important;
                }

                tr:hover {
                    background-color: #f2f2f2 !important;
                }

                @page {
                    size: landscape;
                    margin: 2mm; /* Further reduced margin */
                }

                body {
                    margin: 0;
                    padding: 0;
                }

                html {
                    margin: 0;
                    padding: 0;
                }
            }
        </style>
    `;

    document.body.innerHTML = themeStyles + printStyles + '<div class="table-container ' + currentTheme + '">' + printContent + '</div>';
    window.print();
    document.body.innerHTML = originalContent;
    document.querySelector(`#theme-select`).value = currentTheme; // Restore the theme selection
    applyTheme(currentTheme); // Reapply the theme after printing
    setupEventListeners(); // Reapply event listeners
    enableRowDragAndDrop(); // Reapply drag-and-drop
}
