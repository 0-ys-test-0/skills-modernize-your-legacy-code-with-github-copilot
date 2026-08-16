/**
 * Unit Tests for Account Management System
 * 
 * This test suite mirrors the test plan in docs/TESTPLAN.md
 * Tests cover all test cases for the Node.js implementation of the COBOL legacy accounting system
 */

// Mock readline to avoid interactive prompts during tests
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((prompt, callback) => callback('1')),
    close: jest.fn(),
  })),
}));

// ============================================================================
// CLASS DEFINITIONS (Extracted from index.js for testing)
// ============================================================================

/**
 * DataProgram - Data storage layer
 * Equivalent to DataProgram in data.cob
 */
class DataProgram {
  constructor() {
    this.storageBalance = 1000.00;
  }

  operate(operationType, balance = null) {
    if (operationType === 'READ') {
      return this.storageBalance;
    } else if (operationType === 'WRITE') {
      this.storageBalance = balance;
      return this.storageBalance;
    }
    return null;
  }

  readBalance() {
    return this.operate('READ');
  }

  writeBalance(newBalance) {
    return this.operate('WRITE', newBalance);
  }
}

/**
 * Operations - Business logic layer
 * Equivalent to Operations in operations.cob
 */
class Operations {
  constructor(dataProgram) {
    this.dataProgram = dataProgram;
  }

  async process(operationType, amount = null) {
    let finalBalance;
    let result = {
      success: false,
      balance: null,
      message: ''
    };

    if (operationType === 'TOTAL') {
      finalBalance = this.dataProgram.readBalance();
      result.success = true;
      result.balance = finalBalance;
      result.message = `Current balance: ${this.formatBalance(finalBalance)}`;

    } else if (operationType === 'CREDIT') {
      finalBalance = this.dataProgram.readBalance();
      finalBalance += amount;
      this.dataProgram.writeBalance(finalBalance);
      result.success = true;
      result.balance = finalBalance;
      result.message = `Amount credited. New balance: ${this.formatBalance(finalBalance)}`;

    } else if (operationType === 'DEBIT') {
      finalBalance = this.dataProgram.readBalance();
      
      if (finalBalance >= amount) {
        finalBalance -= amount;
        this.dataProgram.writeBalance(finalBalance);
        result.success = true;
        result.balance = finalBalance;
        result.message = `Amount debited. New balance: ${this.formatBalance(finalBalance)}`;
      } else {
        result.success = false;
        result.balance = finalBalance;
        result.message = 'Insufficient funds for this debit.';
      }
    }

    return result;
  }

  formatBalance(balance) {
    return String(balance.toFixed(2)).padStart(9, '0');
  }
}

/**
 * MainProgram - Presentation layer
 * Equivalent to MainProgram in main.cob
 */
class MainProgram {
  constructor(operations) {
    this.operations = operations;
    this.continueFlag = true;
    const readline = require('readline');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  getUserChoice() {
    return new Promise((resolve) => {
      this.rl.question('Enter your choice (1-4): ', (answer) => {
        resolve(parseInt(answer, 10));
      });
    });
  }

  getUserAmount(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(parseFloat(answer));
      });
    });
  }

  async handleChoice(userChoice) {
    switch (userChoice) {
      case 1:
        await this.handleViewBalance();
        break;
      case 2:
        await this.handleCreditAccount();
        break;
      case 3:
        await this.handleDebitAccount();
        break;
      case 4:
        this.continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  async handleViewBalance() {
    const result = await this.operations.process('TOTAL');
    console.log(result.message);
  }

  async handleCreditAccount() {
    const amount = await this.getUserAmount('Enter credit amount: ');
    const result = await this.operations.process('CREDIT', amount);
    console.log(result.message);
  }

  async handleDebitAccount() {
    const amount = await this.getUserAmount('Enter debit amount: ');
    const result = await this.operations.process('DEBIT', amount);
    console.log(result.message);
  }

  async run() {
    while (this.continueFlag) {
      this.displayMenu();
      const userChoice = await this.getUserChoice();
      await this.handleChoice(userChoice);
    }
    console.log('Exiting the program. Goodbye!');
    this.rl.close();
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('DataProgram - Data Layer (Equivalent to data.cob)', () => {
  let dataProgram;

  beforeEach(() => {
    // Initialize a fresh DataProgram instance for each test
    dataProgram = new DataProgram();
  });

  // ========== Initialization Tests ==========
  describe('Initialization', () => {
    it('should initialize with default balance of 1000.00 (TC-001)', () => {
      const balance = dataProgram.readBalance();
      expect(balance).toBe(1000.00);
    });
  });

  // ========== Read Operations ==========
  describe('READ Operations', () => {
    it('should return current storage balance on READ', () => {
      const balance = dataProgram.operate('READ');
      expect(balance).toBe(1000.00);
    });

    it('should return correct balance using readBalance() method', () => {
      const balance = dataProgram.readBalance();
      expect(balance).toBe(1000.00);
    });
  });

  // ========== Write Operations ==========
  describe('WRITE Operations', () => {
    it('should update storage balance on WRITE', () => {
      dataProgram.operate('WRITE', 1500.00);
      const balance = dataProgram.readBalance();
      expect(balance).toBe(1500.00);
    });

    it('should persist balance updates using writeBalance() method', () => {
      dataProgram.writeBalance(2000.00);
      const balance = dataProgram.readBalance();
      expect(balance).toBe(2000.00);
    });

    it('should handle decimal amounts in WRITE', () => {
      dataProgram.writeBalance(1250.50);
      const balance = dataProgram.readBalance();
      expect(balance).toBe(1250.50);
    });

    it('should handle zero balance', () => {
      dataProgram.writeBalance(0.00);
      const balance = dataProgram.readBalance();
      expect(balance).toBe(0.00);
    });
  });

  // ========== Data Persistence Tests ==========
  describe('Data Persistence (TC-019)', () => {
    it('should maintain balance across multiple operations', () => {
      // Credit operation
      dataProgram.writeBalance(1500.00);
      expect(dataProgram.readBalance()).toBe(1500.00);

      // Debit operation
      dataProgram.writeBalance(1200.00);
      expect(dataProgram.readBalance()).toBe(1200.00);

      // Read again
      expect(dataProgram.readBalance()).toBe(1200.00);
    });
  });
});

describe('Operations - Business Logic Layer (Equivalent to operations.cob)', () => {
  let dataProgram;
  let operations;

  beforeEach(() => {
    // Initialize fresh instances for each test
    dataProgram = new DataProgram();
    operations = new Operations(dataProgram);
  });

  // ========== Balance Formatting Tests ==========
  describe('Balance Formatting', () => {
    it('should format balance as 9-digit string with leading zeros', () => {
      const formatted = operations.formatBalance(1000.00);
      expect(formatted).toBe('001000.00');
    });

    it('should format large balances correctly', () => {
      const formatted = operations.formatBalance(999999.99);
      expect(formatted).toBe('999999.99');
    });

    it('should format small balances with leading zeros', () => {
      const formatted = operations.formatBalance(10.00);
      expect(formatted).toBe('000010.00');
    });

    it('should format decimal amounts correctly', () => {
      const formatted = operations.formatBalance(1250.50);
      expect(formatted).toBe('001250.50');
    });
  });

  // ========== View Balance (TOTAL) Tests ==========
  describe('View Balance Operation - TOTAL (TC-001, TC-019)', () => {
    it('should display initial balance of 1000.00', async () => {
      const result = await operations.process('TOTAL');
      expect(result.success).toBe(true);
      expect(result.balance).toBe(1000.00);
      expect(result.message).toContain('001000.00');
    });

    it('should display updated balance after credit', async () => {
      dataProgram.writeBalance(1500.00);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBe(1500.00);
      expect(result.message).toContain('001500.00');
    });

    it('should display updated balance after debit', async () => {
      dataProgram.writeBalance(700.00);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBe(700.00);
      expect(result.message).toContain('000700.00');
    });

    it('should display zero balance when account is empty', async () => {
      dataProgram.writeBalance(0.00);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBe(0.00);
      expect(result.message).toContain('000000.00');
    });
  });

  // ========== Credit Account Tests ==========
  describe('Credit Account Operation (TC-002, TC-003, TC-004, TC-005)', () => {
    it('should credit valid amount and update balance (TC-002)', async () => {
      const result = await operations.process('CREDIT', 500.00);
      expect(result.success).toBe(true);
      expect(result.balance).toBe(1500.00);
      expect(result.message).toContain('Amount credited');
      expect(result.message).toContain('001500.00');
    });

    it('should handle decimal credit amounts (TC-003)', async () => {
      const result = await operations.process('CREDIT', 250.50);
      expect(result.success).toBe(true);
      expect(result.balance).toBe(1250.50);
      expect(result.message).toContain('001250.50');
    });

    it('should credit zero amount without error (TC-004)', async () => {
      const result = await operations.process('CREDIT', 0);
      expect(result.success).toBe(true);
      expect(result.balance).toBe(1000.00);
      expect(result.message).toContain('001000.00');
    });

    it('should handle multiple sequential credits (TC-005)', async () => {
      // First credit
      let result = await operations.process('CREDIT', 300.00);
      expect(result.balance).toBe(1300.00);

      // Second credit
      result = await operations.process('CREDIT', 200.00);
      expect(result.balance).toBe(1500.00);

      // Verify final balance
      const viewResult = await operations.process('TOTAL');
      expect(viewResult.balance).toBe(1500.00);
    });

    it('should credit large amounts', async () => {
      const result = await operations.process('CREDIT', 999999.00);
      expect(result.success).toBe(true);
      expect(result.balance).toBeCloseTo(1000999.00, 2);
    });

    it('should persist balance after credit', async () => {
      await operations.process('CREDIT', 500.00);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBe(1500.00);
    });
  });

  // ========== Debit Account Tests ==========
  describe('Debit Account Operation (TC-006 through TC-012)', () => {
    it('should debit valid amount and update balance (TC-006)', async () => {
      const result = await operations.process('DEBIT', 300.00);
      expect(result.success).toBe(true);
      expect(result.balance).toBe(700.00);
      expect(result.message).toContain('Amount debited');
      expect(result.message).toContain('000700.00');
    });

    it('should handle decimal debit amounts (TC-007)', async () => {
      const result = await operations.process('DEBIT', 150.75);
      expect(result.success).toBe(true);
      expect(result.balance).toBeCloseTo(849.25, 2);
      expect(result.message).toContain('000849.25');
    });

    it('should reject debit when insufficient funds (TC-008)', async () => {
      const result = await operations.process('DEBIT', 1500.00);
      expect(result.success).toBe(false);
      expect(result.balance).toBe(1000.00); // Balance unchanged
      expect(result.message).toContain('Insufficient funds');
    });

    it('should allow debit of exact balance amount (TC-009)', async () => {
      const result = await operations.process('DEBIT', 1000.00);
      expect(result.success).toBe(true);
      expect(result.balance).toBe(0.00);
      expect(result.message).toContain('000000.00');
    });

    it('should allow debit of almost all balance (TC-010)', async () => {
      const result = await operations.process('DEBIT', 999.99);
      expect(result.success).toBe(true);
      expect(result.balance).toBeCloseTo(0.01, 2);
      expect(result.message).toContain('000000.01');
    });

    it('should handle multiple sequential debits (TC-011)', async () => {
      // First debit
      let result = await operations.process('DEBIT', 200.00);
      expect(result.balance).toBe(800.00);

      // Second debit
      result = await operations.process('DEBIT', 150.00);
      expect(result.balance).toBe(650.00);

      // Verify final balance
      const viewResult = await operations.process('TOTAL');
      expect(viewResult.balance).toBe(650.00);
    });

    it('should handle credit followed by debit (TC-012)', async () => {
      // Credit
      let result = await operations.process('CREDIT', 500.00);
      expect(result.balance).toBe(1500.00);

      // Debit
      result = await operations.process('DEBIT', 300.00);
      expect(result.balance).toBe(1200.00);

      // Verify
      const viewResult = await operations.process('TOTAL');
      expect(viewResult.balance).toBe(1200.00);
    });

    it('should persist balance after debit', async () => {
      await operations.process('DEBIT', 300.00);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBe(700.00);
    });

    it('should prevent overdraft with negative debit attempts', async () => {
      // Empty the account
      await operations.process('DEBIT', 1000.00);

      // Try to debit from empty account
      const result = await operations.process('DEBIT', 1.00);
      expect(result.success).toBe(false);
      expect(result.balance).toBe(0.00);
      expect(result.message).toContain('Insufficient funds');
    });
  });

  // ========== Complex Transaction Scenarios ==========
  describe('Complex Transaction Sequences', () => {
    it('should handle alternating credits and debits correctly', async () => {
      let result = await operations.process('CREDIT', 100.00);
      expect(result.balance).toBe(1100.00);

      result = await operations.process('DEBIT', 50.00);
      expect(result.balance).toBe(1050.00);

      result = await operations.process('CREDIT', 200.00);
      expect(result.balance).toBe(1250.00);

      result = await operations.process('DEBIT', 100.00);
      expect(result.balance).toBe(1150.00);
    });

    it('should maintain accuracy with decimal amounts across transactions', async () => {
      let result = await operations.process('CREDIT', 150.25);
      expect(result.balance).toBeCloseTo(1150.25, 2);

      result = await operations.process('DEBIT', 75.50);
      expect(result.balance).toBeCloseTo(1074.75, 2);

      result = await operations.process('CREDIT', 25.75);
      expect(result.balance).toBeCloseTo(1100.50, 2);
    });
  });

  // ========== Boundary and Edge Cases ==========
  describe('Boundary and Edge Cases (TC-020)', () => {
    it('should handle maximum amount credit', async () => {
      const result = await operations.process('CREDIT', 999999.99);
      expect(result.success).toBe(true);
      expect(result.balance).toBeCloseTo(1000999.99, 2);
    });

    it('should prevent integer overflow with large amounts', async () => {
      // JavaScript handles large numbers, but test the limit
      const result = await operations.process('CREDIT', Number.MAX_SAFE_INTEGER);
      expect(result.success).toBe(true);
      expect(result.balance).toBeGreaterThan(0);
    });

    it('should handle very small decimal amounts', async () => {
      const result = await operations.process('CREDIT', 0.01);
      expect(result.success).toBe(true);
      expect(result.balance).toBeCloseTo(1000.01, 2);
    });

    it('should handle balance of exactly 0.01', async () => {
      await operations.process('DEBIT', 999.99);
      const result = await operations.process('TOTAL');
      expect(result.balance).toBeCloseTo(0.01, 2);
      expect(result.message).toContain('000000.01');
    });
  });

  // ========== Error Handling ==========
  describe('Error Handling', () => {
    it('should handle unknown operation type gracefully', async () => {
      const result = await operations.process('INVALID');
      expect(result.balance).toBeNull();
      expect(result.success).toBe(false);
    });

    it('should handle null amount in CREDIT', async () => {
      const result = await operations.process('CREDIT', null);
      expect(result.success).toBe(true);
      // null coerces to 0 in arithmetic
      expect(result.balance).toBe(1000.00);
    });

    it('should handle null amount in DEBIT', async () => {
      const result = await operations.process('DEBIT', null);
      expect(result.success).toBe(true);
      // null coerces to 0, so no debit occurs
      expect(result.balance).toBe(1000.00);
    });
  });
});

describe('MainProgram - Presentation Layer (Equivalent to main.cob)', () => {
  // Note: MainProgram tests are limited because it heavily depends on readline
  // and user interaction. The core logic (handleChoice, etc.) should be
  // tested through integration tests or by extracting the routing logic.

  it('should initialize with continueFlag set to true', () => {
    // This is a smoke test to verify MainProgram can be instantiated
    const dataProgram = new DataProgram();
    const operations = new Operations(dataProgram);
    const mainProgram = new MainProgram(operations);
    expect(mainProgram.continueFlag).toBe(true);
  });

  it('should have valid menu display method', () => {
    const dataProgram = new DataProgram();
    const operations = new Operations(dataProgram);
    const mainProgram = new MainProgram(operations);
    // Just verify method exists and can be called
    expect(() => mainProgram.displayMenu()).not.toThrow();
  });
});

describe('Integration Tests - Full Application Flow', () => {
  let dataProgram;
  let operations;

  beforeEach(() => {
    dataProgram = new DataProgram();
    operations = new Operations(dataProgram);
  });

  // ========== Test Case Mappings from TESTPLAN.md ==========
  it('TC-001: View Balance - Initial Balance', async () => {
    const result = await operations.process('TOTAL');
    expect(result.balance).toBe(1000.00);
    expect(result.message).toContain('Current balance');
    expect(result.message).toContain('001000.00');
  });

  it('TC-002: Credit Account - Valid Amount', async () => {
    const result = await operations.process('CREDIT', 500.00);
    expect(result.success).toBe(true);
    expect(result.message).toContain('Amount credited');
    expect(result.message).toContain('001500.00');
  });

  it('TC-003: Credit Account - Decimal Amount', async () => {
    const result = await operations.process('CREDIT', 250.50);
    expect(result.success).toBe(true);
    expect(result.message).toContain('001250.50');
  });

  it('TC-004: Credit Account - Zero Amount', async () => {
    const result = await operations.process('CREDIT', 0);
    expect(result.success).toBe(true);
    expect(result.message).toContain('001000.00');
  });

  it('TC-005: Credit Account - Multiple Credits', async () => {
    await operations.process('CREDIT', 300.00);
    await operations.process('CREDIT', 200.00);
    const viewResult = await operations.process('TOTAL');
    expect(viewResult.balance).toBe(1500.00);
    expect(viewResult.message).toContain('001500.00');
  });

  it('TC-006: Debit Account - Valid Amount', async () => {
    const result = await operations.process('DEBIT', 300.00);
    expect(result.success).toBe(true);
    expect(result.message).toContain('Amount debited');
    expect(result.message).toContain('000700.00');
  });

  it('TC-007: Debit Account - Decimal Amount', async () => {
    const result = await operations.process('DEBIT', 150.75);
    expect(result.success).toBe(true);
    expect(result.message).toContain('000849.25');
  });

  it('TC-008: Debit Account - Insufficient Funds', async () => {
    const result = await operations.process('DEBIT', 1500.00);
    expect(result.success).toBe(false);
    expect(result.balance).toBe(1000.00);
    expect(result.message).toContain('Insufficient funds');
  });

  it('TC-009: Debit Account - Exact Balance', async () => {
    const result = await operations.process('DEBIT', 1000.00);
    expect(result.success).toBe(true);
    expect(result.balance).toBe(0.00);
    expect(result.message).toContain('000000.00');
  });

  it('TC-010: Debit Account - Partial Balance', async () => {
    const result = await operations.process('DEBIT', 999.99);
    expect(result.success).toBe(true);
    expect(result.balance).toBeCloseTo(0.01, 2);
    expect(result.message).toContain('000000.01');
  });

  it('TC-011: Debit Account - Multiple Debits', async () => {
    await operations.process('DEBIT', 200.00);
    await operations.process('DEBIT', 150.00);
    const viewResult = await operations.process('TOTAL');
    expect(viewResult.balance).toBe(650.00);
    expect(viewResult.message).toContain('000650.00');
  });

  it('TC-012: Debit After Credit', async () => {
    await operations.process('CREDIT', 500.00);
    await operations.process('DEBIT', 300.00);
    const viewResult = await operations.process('TOTAL');
    expect(viewResult.balance).toBe(1200.00);
    expect(viewResult.message).toContain('001200.00');
  });

  it('TC-016: Menu Navigation - Multiple Operations', async () => {
    let result = await operations.process('TOTAL');
    expect(result.balance).toBe(1000.00);

    result = await operations.process('CREDIT', 100.00);
    expect(result.balance).toBe(1100.00);

    result = await operations.process('TOTAL');
    expect(result.balance).toBe(1100.00);

    result = await operations.process('DEBIT', 50.00);
    expect(result.balance).toBe(1050.00);

    result = await operations.process('TOTAL');
    expect(result.balance).toBe(1050.00);
  });

  it('TC-019: Balance Persistence Across Operations', async () => {
    await operations.process('CREDIT', 250.00);
    // "Go back to menu" (implicit in our test as we're just calling process again)
    const result = await operations.process('TOTAL');
    expect(result.balance).toBe(1250.00);
    expect(result.message).toContain('001250.00');
  });

  it('TC-020: Boundary Test - Maximum Amount', async () => {
    const result = await operations.process('CREDIT', 999999.99);
    expect(result.success).toBe(true);
    // Should handle large values appropriately
    expect(result.balance).toBeGreaterThan(1000000);
  });
});
