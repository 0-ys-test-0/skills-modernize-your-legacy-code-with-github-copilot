/**
 * Account Management System - Node.js Implementation
 * 
 * Converted from COBOL to Node.js
 * Original Programs:
 *   - main.cob: MainProgram - Menu orchestration
 *   - operations.cob: Operations - Business logic
 *   - data.cob: DataProgram - Data storage
 */

const readline = require('readline');

// ============================================================================
// DATA LAYER - Equivalent to DataProgram (data.cob)
// ============================================================================

class DataProgram {
  constructor() {
    // Initialize storage balance (STORAGE-BALANCE PIC 9(6)V99 VALUE 1000.00)
    this.storageBalance = 1000.00;
  }

  /**
   * Performs READ or WRITE operations on account balance
   * Equivalent to DataProgram PROCEDURE DIVISION
   * 
   * @param {string} operationType - 'READ' or 'WRITE'
   * @param {number} balance - Balance value (used for WRITE operations)
   * @returns {number} Balance value (returned for READ operations)
   */
  operate(operationType, balance = null) {
    if (operationType === 'READ') {
      // READ Operation: Return current stored balance
      return this.storageBalance;
    } else if (operationType === 'WRITE') {
      // WRITE Operation: Update and persist the account balance
      this.storageBalance = balance;
      return this.storageBalance;
    }
    return null;
  }

  // Public methods for easier testing
  readBalance() {
    return this.operate('READ');
  }

  writeBalance(newBalance) {
    return this.operate('WRITE', newBalance);
  }
}

// ============================================================================
// BUSINESS LOGIC LAYER - Equivalent to Operations (operations.cob)
// ============================================================================

class Operations {
  constructor(dataProgram) {
    this.dataProgram = dataProgram;
  }

  /**
   * Processes account operations: TOTAL, CREDIT, or DEBIT
   * Equivalent to Operations PROCEDURE DIVISION
   * 
   * @param {string} operationType - 'TOTAL', 'CREDIT', or 'DEBIT'
   * @param {number} amount - Transaction amount (used for CREDIT/DEBIT)
   * @returns {Promise<{success: boolean, balance: number, message: string}>}
   */
  async process(operationType, amount = null) {
    let finalBalance;
    let result = {
      success: false,
      balance: null,
      message: ''
    };

    if (operationType === 'TOTAL') {
      // TOTAL Operation: View Balance
      // Equivalent to: CALL 'DataProgram' USING 'READ', FINAL-BALANCE
      finalBalance = this.dataProgram.readBalance();
      result.success = true;
      result.balance = finalBalance;
      result.message = `Current balance: ${this.formatBalance(finalBalance)}`;

    } else if (operationType === 'CREDIT') {
      // CREDIT Operation: Add funds to account
      // Equivalent to:
      //   CALL 'DataProgram' USING 'READ', FINAL-BALANCE
      //   ADD AMOUNT TO FINAL-BALANCE
      //   CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
      finalBalance = this.dataProgram.readBalance();
      finalBalance += amount;
      this.dataProgram.writeBalance(finalBalance);
      result.success = true;
      result.balance = finalBalance;
      result.message = `Amount credited. New balance: ${this.formatBalance(finalBalance)}`;

    } else if (operationType === 'DEBIT') {
      // DEBIT Operation: Withdraw funds from account with validation
      // Equivalent to:
      //   CALL 'DataProgram' USING 'READ', FINAL-BALANCE
      //   IF FINAL-BALANCE >= AMOUNT
      //     SUBTRACT AMOUNT FROM FINAL-BALANCE
      //     CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
      finalBalance = this.dataProgram.readBalance();
      
      if (finalBalance >= amount) {
        // Sufficient funds: proceed with debit
        finalBalance -= amount;
        this.dataProgram.writeBalance(finalBalance);
        result.success = true;
        result.balance = finalBalance;
        result.message = `Amount debited. New balance: ${this.formatBalance(finalBalance)}`;
      } else {
        // Insufficient funds: reject transaction
        result.success = false;
        result.balance = finalBalance;
        result.message = 'Insufficient funds for this debit.';
      }
    }

    return result;
  }

  /**
   * Formats balance for display (matches COBOL PIC 9(6)V99 format)
   * @param {number} balance - Balance value
   * @returns {string} Formatted balance string
   */
  formatBalance(balance) {
    return String(balance.toFixed(2)).padStart(9, '0');
  }
}

// ============================================================================
// PRESENTATION LAYER - Equivalent to MainProgram (main.cob)
// ============================================================================

class MainProgram {
  constructor(operations) {
    this.operations = operations;
    this.continueFlag = true;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Displays the main menu
   * Equivalent to MainProgram DISPLAY statements
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Prompts user for input and returns the choice
   * Equivalent to ACCEPT USER-CHOICE
   * 
   * @returns {Promise<number>} User menu choice
   */
  getUserChoice() {
    return new Promise((resolve) => {
      this.rl.question('Enter your choice (1-4): ', (answer) => {
        resolve(parseInt(answer, 10));
      });
    });
  }

  /**
   * Prompts user for a numeric amount
   * 
   * @param {string} prompt - The prompt to display
   * @returns {Promise<number>} User-entered amount
   */
  getUserAmount(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(parseFloat(answer));
      });
    });
  }

  /**
   * Routes user choice to appropriate operation
   * Equivalent to MainProgram EVALUATE USER-CHOICE
   * 
   * @param {number} userChoice - User's menu selection
   * @returns {Promise<void>}
   */
  async handleChoice(userChoice) {
    switch (userChoice) {
      case 1:
        // WHEN 1: CALL 'Operations' USING 'TOTAL'
        await this.handleViewBalance();
        break;

      case 2:
        // WHEN 2: CALL 'Operations' USING 'CREDIT'
        await this.handleCreditAccount();
        break;

      case 3:
        // WHEN 3: CALL 'Operations' USING 'DEBIT'
        await this.handleDebitAccount();
        break;

      case 4:
        // WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
        this.continueFlag = false;
        break;

      default:
        // WHEN OTHER: Display error message
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Handles View Balance operation (Option 1)
   */
  async handleViewBalance() {
    const result = await this.operations.process('TOTAL');
    console.log(result.message);
  }

  /**
   * Handles Credit Account operation (Option 2)
   */
  async handleCreditAccount() {
    const amount = await this.getUserAmount('Enter credit amount: ');
    const result = await this.operations.process('CREDIT', amount);
    console.log(result.message);
  }

  /**
   * Handles Debit Account operation (Option 3)
   */
  async handleDebitAccount() {
    const amount = await this.getUserAmount('Enter debit amount: ');
    const result = await this.operations.process('DEBIT', amount);
    console.log(result.message);
  }

  /**
   * Main program loop
   * Equivalent to MainProgram PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  async run() {
    while (this.continueFlag) {
      this.displayMenu();
      const userChoice = await this.getUserChoice();
      await this.handleChoice(userChoice);
    }

    // DISPLAY "Exiting the program. Goodbye!"
    console.log('Exiting the program. Goodbye!');
    this.rl.close();
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

async function main() {
  // Initialize data layer
  const dataProgram = new DataProgram();

  // Initialize business logic layer
  const operations = new Operations(dataProgram);

  // Initialize presentation layer
  const mainProgram = new MainProgram(operations);

  // Run the application
  // Equivalent to: STOP RUN
  await mainProgram.run();
}

// Start the application
main().catch((error) => {
  console.error('Application error:', error);
  process.exit(1);
});
