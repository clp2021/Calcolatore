// Mappa delle proporzioni in base alla compagnia
const RATIOS = {
    Gnv: { sbarco: 25, carico: 19 },
    Grimaldi: { sbarco: 22, carico: 16 },
    Autovetture: 40 // Proporzione fissa per le auto
};

// Regole di pagamento per i pezzi extra
const BONUS_RULES = {
    LIMIT_LOW_RATE: 18, // Fino a 18 pezzi
    RATE_LOW: 5,       // Euro per pezzo (1 a 18)
    RATE_HIGH: 10      // Euro per pezzo (dal 19 in poi)
};

/**
 * Calcola l'efficienza del personale, il carico extra e il bonus.
 */
function calculate() {
    // 1. Recupero dei valori di input. Uso '0' come fallback per i campi vuoti.
    const company = document.getElementById('company').value;
    const piecesSbarco = parseFloat(document.getElementById('piecesSbarco').value) || 0;
    const piecesCarico = parseFloat(document.getElementById('piecesCarico').value) || 0;
    const piecesAuto = parseFloat(document.getElementById('piecesAuto').value) || 0;
    const totalStaffAvailable = parseFloat(document.getElementById('totalStaffAvailable').value) || 0;

    // Se la compagnia non è selezionata o non c'è personale disponibile, azzera i risultati ma mostra 0.00
    if (!company) {
        updateResults(0, 0, 0, 0);
        return;
    }

    // 2. Definizione delle proporzioni in base alla compagnia
    const { sbarco, carico } = RATIOS[company];
    const autoRatio = RATIOS.Autovetture;

    // --- FASE A: Calcolo del Personale Teorico Richiesto (Staffing) ---
    
    const staffRequiredSbarco = piecesSbarco / sbarco;
    const staffRequiredAuto = piecesAuto / autoRatio;
    const staffRequiredCarico = piecesCarico / carico;
    const staffTotalRequired = staffRequiredSbarco + staffRequiredCarico + staffRequiredAuto;

    // --- FASE B: Calcolo dell'Efficienza (Staff Deficit/Surplus) ---
    const staffDeficit = totalStaffAvailable - staffTotalRequired;
    
    
    // --- FASE C: Calcolo Pezzi Extra Caricati (Performance) ---
    
    let piecesExtra = 0;
    if (totalStaffAvailable > 0) {
        const staffAvailableForCarico = totalStaffAvailable - staffRequiredSbarco - staffRequiredAuto;
        const piecesTheoreticalCarico = Math.max(0, staffAvailableForCarico) * carico;
        piecesExtra = piecesCarico - piecesTheoreticalCarico;
    }


    // --- FASE D: Calcolo del Bonus Economico ---

    let totalBonusAmount = 0;
    let bonusPerEmployee = 0;
    
    if (piecesExtra > 0) {
        const piecesRounded = Math.floor(piecesExtra);
        if (piecesRounded > 0) {
            if (piecesRounded <= BONUS_RULES.LIMIT_LOW_RATE) {
                totalBonusAmount = piecesRounded * BONUS_RULES.RATE_LOW;
            } else {
                const piecesAtLowRate = BONUS_RULES.LIMIT_LOW_RATE;
                const piecesAtHighRate = piecesRounded - BONUS_RULES.LIMIT_LOW_RATE;
                totalBonusAmount = (piecesAtLowRate * BONUS_RULES.RATE_LOW) + (piecesAtHighRate * BONUS_RULES.RATE_HIGH);
            }
        }
    }
    
    if (totalStaffAvailable > 0) {
        bonusPerEmployee = totalBonusAmount / totalStaffAvailable;
    }


    // 4. Aggiornamento dell'interfaccia utente
    updateResults(staffTotalRequired, staffDeficit, piecesExtra, bonusPerEmployee);
}

/**
 * Aggiorna gli elementi di output con i risultati calcolati.
 */
function updateResults(required, deficit, extra, bonus) {
    const personnelRequired = document.getElementById('resultPersonnelRequired');
    const staffDeficitEl = document.getElementById('resultStaffDeficit');
    const containerStaffDeficit = document.getElementById('containerStaffDeficit');
    const labelStaffDeficit = document.getElementById('labelStaffDeficit');
    const piecesExtraEl = document.getElementById('resultPiecesExtra');
    const bonusPerEmployeeEl = document.getElementById('resultBonusPerEmployee');
    
    // Formattazione generale: mostra sempre 0.00
    personnelRequired.textContent = required.toFixed(2);
    piecesExtraEl.textContent = extra.toFixed(2);
    bonusPerEmployeeEl.textContent = bonus.toFixed(2) + ' €';

    // Gestione visiva del Deficit/Surplus (Colore Rosso per Deficit)
    staffDeficitEl.textContent = Math.abs(deficit).toFixed(2);

    if (deficit < 0) {
        // Deficit (in meno)
        containerStaffDeficit.className = "result-box bg-red-100";
        labelStaffDeficit.textContent = "Personale IN MENO (Deficit)";
        // Applica il colore rosso al testo
        staffDeficitEl.className = "text-2xl mt-1 text-red-700"; 
    } else {
        // Surplus (in più) o zero (mostra verde)
        containerStaffDeficit.className = "result-box bg-green-100";
        labelStaffDeficit.textContent = (deficit === 0) ? "Personale Teorico (Zero Deficit)" : "Personale IN PIÙ (Surplus)";
        staffDeficitEl.className = "text-2xl mt-1 text-green-700";
    }
}

/**
 * Inizializza tutti i campi di input numerici a '0' all'avvio.
 */
function initializeInputs() {
    const inputs = ['totalStaffAvailable', 'piecesSbarco', 'piecesCarico', 'piecesAuto'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = "0"; // Forza il valore a zero
        }
    });
    // Forziamo un calcolo iniziale per popolare i risultati a 0.00
    calculate();
}

// Esegui l'inizializzazione dei campi e il calcolo iniziale al caricamento della pagina
window.onload = initializeInputs;
