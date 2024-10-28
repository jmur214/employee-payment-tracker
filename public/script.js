// public/script.js

document.addEventListener("DOMContentLoaded", function () {
    const johnForm = document.getElementById("john-form");
    const pgsForm = document.getElementById("pgs-form");
    const transactionList = document.getElementById("transaction-list");
    const balanceDisplay = document.getElementById("balance");

    johnForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const johnAmount = parseFloat(document.getElementById("john-amount").value);
        
        // Automatically set type to "debit" for John's transactions
        if (johnAmount) {
            await addTransaction(johnAmount, "debit", "N/A", "cash");
            johnForm.reset();
            fetchTransactions();
        }
    });

    pgsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const pgsAmount = parseFloat(document.getElementById("pgs-amount").value);
        const pgsType = document.getElementById("pgs-type").value;
        const pgsPurpose = document.getElementById("pgs-purpose").value;
        const pgsPaymentMethod = document.getElementById("pgs-payment_method").value;

        if (pgsAmount) {
            await addTransaction(pgsAmount, pgsType, pgsPurpose, pgsPaymentMethod);
            pgsForm.reset();
            fetchTransactions();
        }
    });

    async function addTransaction(amount, type, purpose, payment_method) {
        await fetch("/api/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, type, purpose, payment_method })
        });
    }

    async function fetchTransactions() {
        const response = await fetch("/api/transactions");
        const transactions = await response.json();
        
        transactionList.innerHTML = "";
        let outstandingToJohn = 0; // Keep track of how much is owed to John

        transactions.forEach((transaction) => {
            let transactionDisplay = "";
            
            if (transaction.type === "debit") {
                outstandingToJohn += transaction.amount;
                transactionDisplay = `-${transaction.amount.toFixed(2)} from John`;
            } else {
                outstandingToJohn -= transaction.amount;
                transactionDisplay = `+${transaction.amount.toFixed(2)} (from PGS to John)`;
            }

            const li = document.createElement("li");
            li.innerHTML = `(${transaction.date.split('T')[0]}) ${transactionDisplay} for ${transaction.purpose} via ${transaction.payment_method.replace(/_/g, " ")}`;

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.onclick = async () => {
                await fetch(`/api/transaction/${transaction.id}`, { method: "DELETE" });
                fetchTransactions();
            };

            li.appendChild(deleteButton);
            transactionList.appendChild(li);
        });

        // Update the balance display
        balanceDisplay.textContent = `Outstanding to John: $${outstandingToJohn.toFixed(2)}`;
    }

    fetchTransactions();
});