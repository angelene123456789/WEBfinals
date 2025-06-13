document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("myModal");
    const adminModal = document.getElementById("adminModal");
    const btn = document.getElementById("openModal");
    const adminButton = document.getElementById("adminButton");
    const span = document.getElementsByClassName("close");
    const usageForm = document.getElementById("usageForm");
    const usageTable = document.getElementById("usageTable").getElementsByTagName('tbody')[0];
    const dateFilter = document.getElementById("dateFilter");
    const statusFilter = document.getElementById("statusFilter");
    const adminSubmit = document.getElementById("adminSubmit");
    const adminPinInput = document.getElementById("adminPin");

    let entries = JSON.parse(localStorage.getItem('usageEntries')) || [];

    function saveEntries() {
        localStorage.setItem('usageEntries', JSON.stringify(entries));
    }

    function renderTable() {
        usageTable.innerHTML = ''; 

        entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        entries.forEach((entry) => {
            const newRow = usageTable.insertRow();
            newRow.insertCell(0).innerText = entry.username;
            newRow.insertCell(1).innerText = entry.monitorNumber;
            newRow.insertCell(2).innerText = entry.date;
            newRow.insertCell(3).innerText = entry.checkIn;
            newRow.insertCell(4).innerText = entry.checkOut;
            newRow.insertCell(5).innerText = entry.problems;
            newRow.insertCell(6).innerText = entry.description;

            const statusCell = newRow.insertCell(7);
            if (entry.status === "Pending") {
                const pendingButton = document.createElement("button");
                pendingButton.innerText = "Pending";
                pendingButton.onclick = function () {
                    const pin = prompt("Enter admin PIN:");
                    if (pin === "admin123") {
                        entry.status = "Fixed";
                        saveEntries();
                        renderTable();
                    } else {
                        alert("Incorrect PIN. Access denied.");
                    }
                };
                statusCell.appendChild(pendingButton);
            } else {
                statusCell.innerText = "Fixed";
                statusCell.style.color = "green";
            }
        });
    }

    btn.onclick = () => modal.style.display = "block";

    adminButton.onclick = () => adminModal.style.display = "block";

    for (let i = 0; i < span.length; i++) {
        span[i].onclick = () => {
            modal.style.display = "none";
            adminModal.style.display = "none";
        };
    }
 
    usageForm.onsubmit = function (event) {
        event.preventDefault();

        const entry = {
            username: document.getElementById("username").value,
            monitorNumber: document.getElementById("monitorNumber").value,
            date: document.getElementById("date").value,
            checkIn: document.getElementById("checkIn").value,
            checkOut: document.getElementById("checkOut").value,
            problems: document.getElementById("problems").value,
            description: document.getElementById("description").value,
            status: "Pending"
        };

        entries.push(entry);
        saveEntries();
        renderTable();

        usageForm.reset();
        modal.style.display = "none";
    };
    dateFilter.onchange = function () {
        const filterValue = parseInt(dateFilter.value);
        const today = new Date();

        Array.from(usageTable.rows).forEach(row => {
            const rowDate = new Date(row.cells[2].innerText);
            const dateDiff = Math.floor((today - rowDate) / (1000 * 60 * 60 * 24));
            row.style.display = (isNaN(filterValue) || dateDiff === filterValue) ? "" : "none";
        });
    };

    statusFilter.onchange = function () {
        const filterValue = statusFilter.value;
        Array.from(usageTable.rows).forEach(row => {
            const statusText = row.cells[7].innerText;
            row.style.display = (!filterValue || statusText === filterValue) ? "" : "none";
        });
    };

    adminSubmit.onclick = function () {
        const adminPin = adminPinInput.value;
        if (adminPin === "admin123") {
            if (confirm("Are you sure you want to delete all fixed logins older than one month?")) {
                deleteOldFixedLogins();
            }
        } else {
            alert("Incorrect PIN. Access denied.");
        }
        adminModal.style.display = "none";
    };

    function deleteOldFixedLogins() {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        entries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return !(entry.status === "Fixed" && entryDate < oneMonthAgo);
        });

        saveEntries();
        renderTable();
        alert("All fixed logins older than one month have been deleted.");
    }

    renderTable();
});