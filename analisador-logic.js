document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento de todos os elementos da UI
    const ui = {
        analysisType: document.getElementById('analysis-type'),
        singleFileSection: document.getElementById('single-file-section'),
        twoFilesSection: document.getElementById('two-files-section'),
        singleColumnOptions: document.getElementById('single-column-options'),
        costCenterOptions: document.getElementById('cost-center-options'),
        columnOptionsTwoFiles: document.getElementById('column-options-two-files'),
        valueOptionsTwoFiles: document.getElementById('value-options-two-files'),
        analyzeBtn: document.getElementById('analyze-btn'),
        modalOverlay: document.getElementById('modal-overlay'),
        modalContainer: document.getElementById('modal-container'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalTitle: document.getElementById('modal-title'),
        resultsOutput: document.getElementById('results-output'),
        loader: document.getElementById('loader'),
        modalFooter: document.getElementById('modal-footer'),
        downloadCsvBtn: document.getElementById('download-csv-btn'),
        downloadExcelBtn: document.getElementById('download-excel-btn'),
        fileUpload1: document.getElementById('file-upload-1'),
        fileUploadLeft: document.getElementById('file-upload-left'),
        fileUploadRight: document.getElementById('file-upload-right'),
        fileName1: document.getElementById('file-name-1'),
        fileNameLeft: document.getElementById('file-name-left'),
        fileNameRight: document.getElementById('file-name-right'),
        columnSelector1: document.getElementById('column-selector-1'),
        caseInsensitiveCheckbox: document.getElementById('case-insensitive-checkbox'),
        caseInsensitiveWrapper: document.querySelector('.form-group-inline'),
        categoryColumn: document.getElementById('category-column'),
        valueColumn: document.getElementById('value-column'),
        keyColumnLeft: document.getElementById('key-column-left'),
        keyColumnRight: document.getElementById('key-column-right'),
        valueColumnLeft: document.getElementById('value-column-left'),
        valueColumnRight: document.getElementById('value-column-right'),
        labelFileLeft: document.getElementById('label-file-left'),
        labelFileRight: document.getElementById('label-file-right'),
        labelKeyLeft: document.getElementById('label-key-left'),
        labelKeyRight: document.getElementById('label-key-right'),
        labelValueLeft: document.getElementById('label-value-left'),
        labelValueRight: document.getElementById('label-value-right')
    };

    let data1 = null, data2 = null;
    let currentReportData = []; // Armazena dados do relatório atual para download

    // --- LÓGICA DA INTERFACE MELHORADA ---
    function resetInterface() {
        ui.singleFileSection.style.display = 'none';
        ui.twoFilesSection.style.display = 'none';
        ui.singleColumnOptions.style.display = 'none';
        ui.costCenterOptions.style.display = 'none';
        ui.columnOptionsTwoFiles.style.display = 'none';
        ui.valueOptionsTwoFiles.style.display = 'none';
        ui.caseInsensitiveWrapper.style.display = 'none';
        ui.analyzeBtn.style.display = 'none';
        ui.analyzeBtn.disabled = true;
        
        data1 = null; data2 = null;
        
        // Reset dos inputs de arquivo e nomes
        [ui.fileUpload1, ui.fileUploadLeft, ui.fileUploadRight].forEach(input => input.value = '');
        [ui.fileName1, ui.fileNameLeft, ui.fileNameRight].forEach(label => label.textContent = 'Nenhum arquivo selecionado');
    }
    
    // Atualiza nome do arquivo na UI
    const updateFileName = (input, label) => {
        input.addEventListener('change', () => {
            label.textContent = input.files.length > 0 ? input.files[0].name : 'Nenhum arquivo selecionado';
        });
    };
    updateFileName(ui.fileUpload1, ui.fileName1);
    updateFileName(ui.fileUploadLeft, ui.fileNameLeft);
    updateFileName(ui.fileUploadRight, ui.fileNameRight);

    ui.analysisType.addEventListener('change', () => {
        resetInterface();
        const type = ui.analysisType.value;

        if (type === 'find-duplicates' || type === 'financial-column' || type === 'cost-center') {
            ui.singleFileSection.style.display = 'block';
        } else if (type === 'vlookup' || type === 'bank-reconciliation') {
            ui.twoFilesSection.style.display = 'block';
        }

        if (type === 'find-duplicates' || type === 'financial-column') {
            ui.singleColumnOptions.style.display = 'block';
            if (type === 'find-duplicates') {
                ui.caseInsensitiveWrapper.style.display = 'flex';
            }
        } else if (type === 'cost-center') {
            ui.costCenterOptions.style.display = 'flex';
        }

        if (type === 'vlookup') {
            ui.labelFileLeft.textContent = "2. Planilha Principal";
            ui.labelFileRight.textContent = "3. Planilha de Consulta";
            ui.labelKeyLeft.textContent = "4. Coluna Chave (Principal)";
            ui.labelKeyRight.textContent = "5. Coluna Chave (Consulta)";
            ui.labelValueRight.textContent = "6. Coluna com o Valor a Retornar";
            ui.valueOptionsTwoFiles.style.display = 'block';
            ui.labelValueLeft.style.display = 'none';
            ui.valueColumnLeft.style.display = 'none';
            ui.labelValueRight.style.display = 'block';
            ui.valueColumnRight.style.display = 'block';
        } else if (type === 'bank-reconciliation') {
            ui.labelFileLeft.textContent = "2. Razão Contábil";
            ui.labelFileRight.textContent = "3. Extrato Bancário";
            ui.labelKeyLeft.textContent = "4. Coluna de Identificação (Razão)";
            ui.labelKeyRight.textContent = "5. Coluna de Identificação (Extrato)";
            ui.labelValueLeft.textContent = "6. Coluna de Valor (Razão)";
            ui.labelValueRight.textContent = "7. Coluna de Valor (Extrato)";
            ui.valueOptionsTwoFiles.style.display = 'flex';
            ui.labelValueLeft.style.display = 'block';
            ui.valueColumnLeft.style.display = 'block';
            ui.labelValueRight.style.display = 'block';
            ui.valueColumnRight.style.display = 'block';
        }
    });
    
    // Lógica do Modal e Download
    ui.modalCloseBtn.addEventListener('click', () => ui.modalOverlay.classList.remove('show'));
    ui.modalOverlay.addEventListener('click', (e) => {
        if (e.target === ui.modalOverlay) ui.modalOverlay.classList.remove('show');
    });

    function downloadCSV(data, filename) {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function downloadExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    // --- LÓGICA DE ANÁLISE COM MODAL ---
    ui.analyzeBtn.addEventListener('click', () => {
        ui.resultsOutput.innerHTML = '';
        ui.loader.style.display = 'flex';
        ui.modalFooter.style.display = 'none';
        ui.modalOverlay.classList.add('show');

        setTimeout(() => {
            try {
                const type = ui.analysisType.value;
                const selectedOption = ui.analysisType.options[ui.analysisType.selectedIndex].text;
                ui.modalTitle.textContent = `Resultado: ${selectedOption}`;
                let analysisResult = { html: '', data: [] };

                switch(type) {
                    case 'find-duplicates':
                        analysisResult = analyzeDuplicates(data1, ui.columnSelector1.value, ui.caseInsensitiveCheckbox.checked);
                        break;
                    case 'financial-column':
                        analysisResult = analyzeFinancialColumn(data1, ui.columnSelector1.value);
                        break;
                    case 'cost-center':
                        analysisResult = analyzeCostCenter(data1, ui.categoryColumn.value, ui.valueColumn.value);
                        break;
                    case 'vlookup':
                        analysisResult = analyzeVlookup(data1, data2, ui.keyColumnLeft.value, ui.keyColumnRight.value, ui.valueColumnRight.value);
                        break;
                    case 'bank-reconciliation':
                        analysisResult = analyzeBankReconciliation(data1, data2, ui.keyColumnLeft.value, ui.keyColumnRight.value, ui.valueColumnLeft.value, ui.valueColumnRight.value);
                        break;
                }

                ui.resultsOutput.innerHTML = analysisResult.html;
                currentReportData = analysisResult.data;

                if (currentReportData && currentReportData.length > 0) {
                    ui.modalFooter.style.display = 'flex';
                    const filename = `analise_${type}_${new Date().toISOString().slice(0,10)}`;
                    
                    const newCsvBtn = ui.downloadCsvBtn.cloneNode(true);
                    ui.downloadCsvBtn.parentNode.replaceChild(newCsvBtn, ui.downloadCsvBtn);
                    ui.downloadCsvBtn = newCsvBtn;
                    
                    const newExcelBtn = ui.downloadExcelBtn.cloneNode(true);
                    ui.downloadExcelBtn.parentNode.replaceChild(newExcelBtn, ui.downloadExcelBtn);
                    ui.downloadExcelBtn = newExcelBtn;

                    ui.downloadCsvBtn.addEventListener('click', () => downloadCSV(currentReportData, filename));
                    ui.downloadExcelBtn.addEventListener('click', () => downloadExcel(currentReportData, filename));
                }

            } catch(error) {
                alert("Ocorreu um erro: " + error.message);
                ui.modalOverlay.classList.remove('show');
            } finally {
                ui.loader.style.display = 'none';
            }
        }, 500);
    });

    // --- FUNÇÕES DE PROCESSAMENTO DE ARQUIVO ---
    const setupFileUploader = (fileInput, onDataParsed) => {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    if (fileExtension === 'csv') {
                        Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => {
                            const processedData = res.data.map((row, index) => ({...row, originalIndex: index + 2}));
                            onDataParsed({ data: processedData, meta: res.meta });
                        }});
                    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                        const data = new Uint8Array(event.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                        const processedData = jsonData.map((row, index) => ({...row, originalIndex: index + 2}));
                        const fields = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                        onDataParsed({ data: processedData, meta: { fields: fields } });
                    } else {
                        throw new Error("Formato de arquivo não suportado. Por favor, use .CSV ou .XLSX");
                    }
                } catch (err) {
                    alert("Erro ao processar o arquivo: " + err.message);
                    resetInterface();
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };
    
    const checkFilesReady = (isSingleFile) => {
        if (isSingleFile && data1) {
            ui.analyzeBtn.style.display = 'block';
            ui.analyzeBtn.disabled = false;
        } else if (!isSingleFile && data1 && data2) {
            ui.columnOptionsTwoFiles.style.display = 'flex';
            const type = ui.analysisType.value;
            if (type === 'bank-reconciliation' || type === 'vlookup') {
                ui.valueOptionsTwoFiles.style.display = 'flex';
            }
            ui.analyzeBtn.style.display = 'block';
            ui.analyzeBtn.disabled = false;
        }
    };

    setupFileUploader(ui.fileUpload1, results => {
        data1 = results.data;
        const headers = results.meta.fields;
        populateSelect(ui.columnSelector1, headers);
        populateSelect(ui.categoryColumn, headers);
        populateSelect(ui.valueColumn, headers);
        checkFilesReady(true);
    });
    
    setupFileUploader(ui.fileUploadLeft, results => {
        data1 = results.data;
        populateSelect(ui.keyColumnLeft, results.meta.fields);
        populateSelect(ui.valueColumnLeft, results.meta.fields);
        checkFilesReady(false);
    });
    setupFileUploader(ui.fileUploadRight, results => {
        data2 = results.data;
        populateSelect(ui.keyColumnRight, results.meta.fields);
        populateSelect(ui.valueColumnRight, results.meta.fields);
        checkFilesReady(false);
    });
    
    function populateSelect(selectElement, headers) {
        selectElement.innerHTML = '<option value="">Selecione...</option>';
        headers.forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.textContent = h;
            selectElement.appendChild(option);
        });
    }

    function parseValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return 0;
        const cleaned = value.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    function normalizeKey(key) {
        if (key === null || key === undefined) return "";
        return String(key).trim();
    }
    
    // --- FUNÇÕES DE ANÁLISE (RETORNANDO HTML E DADOS) ---

    function analyzeDuplicates(data, column, isCaseInsensitive) {
        if (!column) throw new Error("Coluna de valores não selecionada.");
        let report = '';
        const values = data.map(row => row[column] || "");
        const processedValues = isCaseInsensitive ? values.map(v => typeof v === 'string' ? v.toLowerCase().trim() : v) : values.map(v => typeof v === 'string' ? v.trim() : v);

        const counts = processedValues.reduce((acc, val) => { if(val) acc[val] = (acc[val] || 0) + 1; return acc; }, {});
        const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
        
        if (duplicates.length > 0) {
            report += `<div class="summary-card" style="border-color: #ffc107;"><h4><span class="iconify" data-icon="ph:warning-fill"></span>Valores Duplicados Encontrados</h4><p>${duplicates.length}</p></div>`;
            report += `<div class="result-section"><h3>Detalhes das Duplicidades</h3><p>${isCaseInsensitive ? 'Análise ignorando maiúsculas/minúsculas.' : 'Análise exata.'}</p></div>`;
            report += `<table><thead><tr><th>Valor</th><th>Nº de Ocorrências</th></tr></thead><tbody>`;
            duplicates.forEach(([val, count]) => {
                report += `<tr><td>${val}</td><td>${count}</td></tr>`;
            });
            report += `</tbody></table>`;
        } else {
            report += `<div class="summary-card" style="border-color: #28a745;"><h4><span class="iconify" data-icon="ph:check-circle-fill"></span>Resultado</h4><p>Nenhuma duplicata encontrada.</p></div>`;
        }
        const reportData = duplicates.map(([Valor, Ocorrencias]) => ({ Valor, Ocorrencias }));
        return { html: report, data: reportData };
    }

    function analyzeFinancialColumn(data, column) {
        if (!column) throw new Error("Coluna de valores não selecionada.");
        let report = ``;
        const values = data.map(row => ({...row, parsedValue: parseValue(row[column])}));

        const debits = values.filter(item => item.parsedValue > 0);
        const credits = values.filter(item => item.parsedValue < 0);
        const totalDebits = debits.reduce((sum, item) => sum + item.parsedValue, 0);
        const totalCredits = credits.reduce((sum, item) => sum + item.parsedValue, 0);
        
        report += `<div class="results-grid">
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:arrow-circle-up-fill" style="color: #28a745;"></span>Total Débitos</h4><p>${totalDebits.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p></div>
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:arrow-circle-down-fill" style="color: #dc3545;"></span>Total Créditos</h4><p>${totalCredits.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p></div>
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:equals-fill"></span>Balanço</h4><p>${(totalDebits + totalCredits).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p></div>
        </div>`;
         if (Math.abs(totalDebits + totalCredits) > 0.01) {
            report += `<p style="text-align:center; font-weight: bold; color: #dc3545;">❗ ATENÇÃO: Os débitos e créditos não batem!</p>`;
        } else {
            report += `<p style="text-align:center; font-weight: bold; color: #28a745;">✅ As partidas estão dobradas corretamente.</p>`;
        }
        
        const reportData = values.map(row => ({...row, Valor_Analisado: row.parsedValue, Tipo: row.parsedValue > 0 ? 'Débito' : 'Crédito' }));
        return { html: report, data: reportData };
    }

    function analyzeCostCenter(data, categoryCol, valueCol) {
        if (!categoryCol || !valueCol) throw new Error("Colunas de categoria e valor devem ser selecionadas.");
        let report = ``;
        const summary = {};
        data.forEach(row => {
            const category = row[categoryCol] || "Sem Categoria";
            const value = parseValue(row[valueCol]);
            if (!summary[category]) summary[category] = { total: 0, count: 0 };
            summary[category].total += value;
            summary[category].count++;
        });

        report += `<table><thead><tr><th>Centro de Custo</th><th>Total</th><th>Nº de Lançamentos</th></tr></thead><tbody>`;
        const sortedSummary = Object.entries(summary).sort((a, b) => b[1].total - a[1].total);
        sortedSummary.forEach(([category, values]) => {
            report += `<tr><td>${category}</td><td>${values.total.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td>${values.count}</td></tr>`;
        });
        report += `</tbody></table>`;
        const reportData = sortedSummary.map(([category, values]) => ({
            'Centro de Custo': category,
            'Total': values.total,
            'Nº de Lançamentos': values.count
        }));
        return { html: report, data: reportData };
    }
    
    function analyzeVlookup(dataLeft, dataRight, keyLeft, keyRight, valueRightCol) {
        if (!keyLeft || !keyRight || !valueRightCol) throw new Error("Todas as colunas devem ser selecionadas.");
        let report = ``;
        const mapRight = new Map(dataRight.map(row => [normalizeKey(row[keyRight]), row]));
        
        report += `<table><thead><tr><th>Chave (Planilha Principal)</th><th>Valor Buscado</th><th>Encontrado na Linha (Consulta)</th></tr></thead><tbody>`;
        let found = 0;
        const reportData = [];
        dataLeft.forEach(rowLeft => {
            const key = normalizeKey(rowLeft[keyLeft]);
            let rowHtml = `<tr><td>${key}</td>`;
            let resultRow = { ...rowLeft, 'Valor Buscado': '#N/A', 'Linha Encontrada': '--' };

            if (mapRight.has(key)) {
                found++;
                const foundRow = mapRight.get(key);
                const foundValue = foundRow[valueRightCol];
                const foundIndex = foundRow.originalIndex;
                rowHtml += `<td>${foundValue}</td><td>${foundIndex}</td>`;
                resultRow['Valor Buscado'] = foundValue;
                resultRow['Linha Encontrada'] = foundIndex;
            } else {
                rowHtml += `<td><span style="color: #dc3545;">#N/A</span></td><td>--</td>`;
            }
            rowHtml += `</tr>`;
            report += rowHtml;
            reportData.push(resultRow);
        });
        report += `</tbody></table>`;
        report += `<p class="results-summary">Total de correspondências encontradas: ${found} de ${dataLeft.length}.</p>`;
        return { html: report, data: reportData };
    }

    function analyzeBankReconciliation(dataLeft, dataRight, keyLeft, keyRight, valueLeftCol, valueRightCol) {
        if (!keyLeft || !keyRight || !valueLeftCol || !valueRightCol) throw new Error("Todas as colunas devem ser selecionadas.");
        
        // Agrupa transações do extrato por chave
        const mapRight = new Map();
        dataRight.forEach(row => {
            const key = normalizeKey(row[keyRight]);
            if (!mapRight.has(key)) mapRight.set(key, []);
            mapRight.get(key).push({...row, used: false}); // Adiciona flag 'used'
        });

        const reconciled = [], discrepancies = [], notFoundInStatement = [];

        dataLeft.forEach(rowLeft => {
            const key = normalizeKey(rowLeft[keyLeft]);
            const valueLeft = parseValue(rowLeft[valueLeftCol]);
            
            if (mapRight.has(key)) {
                const potentialMatches = mapRight.get(key);
                let matchFound = false;
                
                for (let i = 0; i < potentialMatches.length; i++) {
                    const rowRight = potentialMatches[i];
                    if (rowRight.used) continue; // Pula se já foi usado

                    const valueRight = parseValue(rowRight[valueRightCol]);
                    
                    if (Math.abs(valueLeft - valueRight) < 0.01) {
                        reconciled.push({ key, value: valueLeft, lineLeft: rowLeft.originalIndex, lineRight: rowRight.originalIndex });
                        rowRight.used = true; // Marca como usado
                        matchFound = true;
                        break;
                    }
                }
                
                if (!matchFound) {
                     const firstUnusedRightRow = potentialMatches.find(r => !r.used);
                     if (firstUnusedRightRow) {
                        discrepancies.push({ key, valLeft: valueLeft, lineLeft: rowLeft.originalIndex, valRight: parseValue(firstUnusedRightRow[valueRightCol]), lineRight: firstUnusedRightRow.originalIndex });
                     } else { // Se todos com a mesma chave já foram usados, este é um não encontrado
                        notFoundInStatement.push({ key, value: valueLeft, line: rowLeft.originalIndex });
                     }
                }
            } else {
                notFoundInStatement.push({ key, value: valueLeft, line: rowLeft.originalIndex });
            }
        });
        
        const notFoundInReason = Array.from(mapRight.values()).flat().filter(row => !row.used);
        let report = ``;
        report += `<div class="results-grid">
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:check-circle-fill" style="color: #28a745;"></span>Conciliados</h4><p>${reconciled.length}</p></div>
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:warning-fill" style="color: #ffc107;"></span>Divergências de Valor</h4><p>${discrepancies.length}</p></div>
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:question-fill" style="color: #17a2b8;"></span>Não Encontrados no Extrato</h4><p>${notFoundInStatement.length}</p></div>
            <div class="summary-card"><h4><span class="iconify" data-icon="ph:info-fill" style="color: #6c757d;"></span>Não Encontrados na Razão</h4><p>${notFoundInReason.length}</p></div>
        </div>`;

        if (discrepancies.length > 0) {
            report += `<div class="result-section"><h3>❗ Divergências Encontradas</h3></div><table><thead><tr><th>Chave</th><th>Valor (Razão)</th><th>Valor (Extrato)</th><th>Linhas (Razão vs Extrato)</th></tr></thead><tbody>`;
            discrepancies.forEach(d => {
                report += `<tr><td>${d.key}</td><td>${d.valLeft.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td>${d.valRight.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td>${d.lineLeft} vs ${d.lineRight}</td></tr>`;
            });
            report += `</tbody></table>`;
        }
        
        if(notFoundInStatement.length > 0){
             report += `<div class="result-section"><h3>❓ Lançamentos da Razão Não Encontrados no Extrato</h3></div><table><thead><tr><th>Chave</th><th>Valor</th><th>Linha (Razão)</th></tr></thead><tbody>`;
            notFoundInStatement.forEach(item => {
                report += `<tr><td>${item.key}</td><td>${item.value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td>${item.line}</td></tr>`;
            });
            report += `</tbody></table>`;
        }
        
        if(notFoundInReason.length > 0){
             report += `<div class="result-section"><h3>ℹ️ Lançamentos do Extrato Não Encontrados na Razão</h3></div><table><thead><tr><th>Chave</th><th>Valor</th><th>Linha (Extrato)</th></tr></thead><tbody>`;
            notFoundInReason.forEach(item => {
                report += `<tr><td>${normalizeKey(item[keyRight])}</td><td>${parseValue(item[valueRightCol]).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td><td>${item.originalIndex}</td></tr>`;
            });
            report += `</tbody></table>`;
        }

        if(discrepancies.length === 0 && notFoundInStatement.length === 0 && notFoundInReason.length === 0) {
            report += `<div class="result-section" style="text-align:center; padding: 2rem; background-color: var(--cinza-fundo); border-radius: var(--raio-borda);">
                <span class="iconify" data-icon="ph:party-popper-fill" style="font-size: 3rem; color: #28a745;"></span>
                <h3 style="border:none;">Parabéns!</h3>
                <p>Todos os lançamentos foram conciliados com sucesso.</p>
            </div>`;
        }
        
        const allReportData = [];
        reconciled.forEach(item => allReportData.push({ Status: 'Conciliado', Chave: item.key, Valor_Razao: item.value, Linha_Razao: item.lineLeft, Valor_Extrato: item.value, Linha_Extrato: item.lineRight }));
        discrepancies.forEach(item => allReportData.push({ Status: 'Divergência', Chave: item.key, Valor_Razao: item.valLeft, Linha_Razao: item.lineLeft, Valor_Extrato: item.valRight, Linha_Extrato: item.lineRight }));
        notFoundInStatement.forEach(item => allReportData.push({ Status: 'Não Encontrado no Extrato', Chave: item.key, Valor_Razao: item.value, Linha_Razao: item.line, Valor_Extrato: '', Linha_Extrato: '' }));
        notFoundInReason.forEach(item => allReportData.push({ Status: 'Não Encontrado na Razão', Chave: normalizeKey(item[keyRight]), Valor_Razao: '', Linha_Razao: '', Valor_Extrato: parseValue(item[valueRightCol]), Linha_Extrato: item.originalIndex }));

        return { html: report, data: allReportData };
    }
});