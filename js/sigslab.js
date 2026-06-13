// SIGSLAB - Core Business Logic and State Management (mocked using localStorage)

// Predefined mock catalogs
const LABORATORIOS = ["Laboratorio 101 (Cómputo)", "Laboratorio 102 (Sistemas)", "Laboratorio 201 (Electrónica)", "Laboratorio de Redes"];
const TECNICOS = ["Juan Pérez (Bolsista)", "María Gómez (Técnico)", "Carlos López (Bolsista)"];

// Default tickets if localStorage is empty
const DEFAULT_TICKETS = [
    {
        id: "T-1001",
        type: "Incidente",
        lab: "Laboratorio 101 (Cómputo)",
        pc: "PC-12",
        description: "El teclado no responde y tres teclas están físicamente trabadas.",
        status: "Pendiente",
        createdDate: "2026-06-08 09:30",
        creator: "docente@sigslab.edu",
        assignedTo: null,
        correctiveAction: null
    },
    {
        id: "T-1002",
        type: "Software",
        lab: "Laboratorio 201 (Electrónica)",
        pc: "Todas las PCs",
        description: "MATLAB R2024a con toolbox de control y procesamiento de señales.",
        status: "Pendiente",
        createdDate: "2026-06-09 14:15",
        creator: "docente@sigslab.edu",
        assignedTo: null,
        correctiveAction: null
    },
    {
        id: "T-1003",
        type: "Incidente",
        lab: "Laboratorio de Redes",
        pc: "PC-04",
        description: "No conecta a internet. El cable de red parece estar bien pero no obtiene dirección IP por DHCP.",
        status: "Asignado",
        createdDate: "2026-06-10 08:00",
        creator: "docente@sigslab.edu",
        assignedTo: "Juan Pérez (Bolsista)",
        correctiveAction: null
    },
    {
        id: "T-1004",
        type: "Incidente",
        lab: "Laboratorio 102 (Sistemas)",
        pc: "PC-25",
        description: "Pantalla azul al iniciar el sistema operativo Windows 11.",
        status: "Finalizado",
        createdDate: "2026-06-05 10:00",
        creator: "docente@sigslab.edu",
        assignedTo: "María Gómez (Técnico)",
        correctiveAction: "Se procedió a reiniciar el equipo y verificar el código de error en la pantalla azul (PAGE_FAULT_IN_NONPAGED_AREA). Se ingresó en modo seguro y se detectó que el controlador de la tarjeta gráfica integrada estaba corrupto tras una actualización automática fallida del sistema operativo. Se procedió a desinstalar completamente el driver corrupto usando la herramienta DDU en modo seguro. Posteriormente, se descargó e instaló la versión estable más reciente del controlador desde la web oficial del fabricante. Se realizaron tres pruebas de reinicio y benchmarks básicos de carga de video para asegurar la estabilidad del sistema. El equipo ya inicia correctamente y no muestra fallos."
    }
];

// Helper to check user session
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function checkAuth(allowedRole) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    if (user.role !== allowedRole) {
        // Redirect to their respective dashboards if they have an active session of another role
        if (user.role === "docente") {
            window.location.href = "docente.html";
        } else if (user.role === "jefe-soporte") {
            window.location.href = "jefe-soporte.html";
        } else if (user.role === "tecnico") {
            window.location.href = "tecnico.html";
        } else {
            window.location.href = "login.html";
        }
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// Tickets Database Methods
function getTickets() {
    let tickets = localStorage.getItem("tickets");
    if (!tickets) {
        localStorage.setItem("tickets", JSON.stringify(DEFAULT_TICKETS));
        return DEFAULT_TICKETS;
    }
    return JSON.parse(tickets);
}

function saveTickets(tickets) {
    localStorage.setItem("tickets", JSON.stringify(tickets));
}

function createTicket(type, lab, pc, description, creatorEmail) {
    const tickets = getTickets();
    const newId = "T-" + (1000 + tickets.length + 1);
    
    // Format current time
    const now = new Date();
    const dateStr = now.getFullYear() + "-" + 
                    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(now.getDate()).padStart(2, '0') + " " + 
                    String(now.getHours()).padStart(2, '0') + ":" + 
                    String(now.getMinutes()).padStart(2, '0');

    const newTicket = {
        id: newId,
        type: type,
        lab: lab,
        pc: pc || "N/A",
        description: description,
        status: "Pendiente",
        createdDate: dateStr,
        creator: creatorEmail,
        assignedTo: null,
        correctiveAction: null
    };

    tickets.push(newTicket);
    saveTickets(tickets);
    return newTicket;
}

function assignTicket(ticketId, tecnicoName) {
    const tickets = getTickets();
    
    // Count active tickets (not Finalizado) assigned to this technician
    const activeCount = tickets.filter(t => t.assignedTo === tecnicoName && t.status !== 'Finalizado').length;
    if (activeCount >= 12) {
        return "limit_reached";
    }

    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
        tickets[index].assignedTo = tecnicoName;
        tickets[index].status = "Asignado";
        saveTickets(tickets);
        return true;
    }
    return false;
}

function updateTicketStatus(ticketId, newStatus) {
    const tickets = getTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
        // Map any old/custom statuses to the two main statuses
        if (newStatus !== "Pendiente" && newStatus !== "Asignado" && newStatus !== "Finalizado") {
            newStatus = "Finalizado";
        }
        tickets[index].status = newStatus;
        saveTickets(tickets);
        return true;
    }
    return false;
}

function closeTicket(ticketId, correctiveAction) {
    const tickets = getTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
        tickets[index].correctiveAction = correctiveAction || "Sin observaciones registradas.";
        tickets[index].status = "Finalizado";
        saveTickets(tickets);
        return true;
    }
    return false;
}

// Expose to window/global scope for scripts loading this file
window.SIGSLAB = {
    LABORATORIOS,
    TECNICOS,
    getCurrentUser,
    checkAuth,
    logout,
    getTickets,
    createTicket,
    assignTicket,
    updateTicketStatus,
    closeTicket
};
