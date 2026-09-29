// from Date object to GG/MM/YYYY
export function parseDate(date) {
    if (!date) return;
    if (!(date instanceof Date)) date = new Date(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth()+1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function calculatePayments(balances) {
    const creditors = balances
        .filter(x => x.balance > 0)
        .map(x => ({ ...x, balance: Math.round(x.balance * 100) / 100 }))
        .sort((a, b) => b.balance - a.balance);
    const debtors = balances
        .filter(x => x.balance < 0)
        .map(x => ({ ...x, balance: Math.round(-x.balance * 100) / 100 }))
        .sort((a, b) => b.balance - a.balance);

    const payments = [];
    let i=0, j=0;

    while (i<debtors.length && j<creditors.length) {
        const debtor = debtors[i], creditor = creditors[j];
        // let's take the minimum amount and create the payment from debtor to creditor
        const amount = Math.min(debtor.balance, creditor.balance);
        // for cents
        if (amount <= 0) break;
        payments.push({
            from: debtor.id,
            fromMember : debtor,
            to: creditor.id,
            toMember : creditor,
            amount: amount
        });
        // update new balances after the payment
        debtor.balance -= amount;
        creditor.balance -= amount;
        // we see which one is gone to 0 and proceed with next creditor/debtor
        if (debtor.balance === 0) i++;
        if (creditor.balance === 0) j++;
    }
    return payments;
}

export function getInits(str) {
    if (!str) return 'U'; // generic user
    const parts = str.split(' ');
    if (parts.length === 1) return String(parts[0].charAt(0)).toUpperCase();
    if (parts.length > 1) return String(parts[0].charAt(0)+parts[1].charAt(0)).toUpperCase();
}

export function fmtNum(num) {
    return Number(num).toFixed(2).replace('.', ',');
}

export function lightColor(hex, amount = 0.75) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const mix = (value) => Math.round(value + (255 - value) * amount);

    return `#${[mix(r), mix(g), mix(b)]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('')}`;
}
