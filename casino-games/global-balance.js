// 全局余额管理系统
class GlobalBalance {
    constructor() {
        this.storageKey = 'casino_global_balance';
        this.defaultBalance = 1000;
    }

    getBalance() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? parseInt(saved) : this.defaultBalance;
    }

    setBalance(amount) {
        localStorage.setItem(this.storageKey, amount.toString());
        // 触发自定义事件，通知余额变化
        window.dispatchEvent(new CustomEvent('balanceChanged', { detail: { balance: amount } }));
    }

    addBalance(amount) {
        const current = this.getBalance();
        this.setBalance(current + amount);
    }

    subtractBalance(amount) {
        const current = this.getBalance();
        this.setBalance(current - amount);
    }

    reset() {
        this.setBalance(this.defaultBalance);
    }

    hasEnough(amount) {
        return this.getBalance() >= amount;
    }
}

// 创建全局实例
window.globalBalance = new GlobalBalance();
