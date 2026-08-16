# Account Management System - Test Plan

## Overview
This test plan documents the testing strategy for the Account Management System COBOL application. The system provides basic account operations including viewing balance, crediting funds, and debiting funds with validation.

## Test Environment
- **Application**: Account Management System (COBOL)
- **Initial Balance**: 1000.00
- **Platform**: GnuCOBOL Runtime

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | View Balance - Initial Balance | Application started; No previous transactions | 1. Launch application<br>2. Select option 1 (View Balance)<br>3. Observe displayed balance | System displays "Current balance: 001000.00" | | | |
| TC-002 | Credit Account - Valid Amount | Application started; Balance is 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 500.00<br>3. Observe system response | System displays "Amount credited. New balance: 001500.00" | | | |
| TC-003 | Credit Account - Decimal Amount | Application started; Balance is 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 250.50<br>3. Observe system response | System displays "Amount credited. New balance: 001250.50" | | | |
| TC-004 | Credit Account - Zero Amount | Application started; Balance is 1000.00 | 1. Select option 2 (Credit Account)<br>2. Enter amount: 0<br>3. Observe system response | System displays "Amount credited. New balance: 001000.00" | | | |
| TC-005 | Credit Account - Multiple Credits | Application started; Balance is 1000.00 | 1. Credit 300.00 (Balance should be 1300.00)<br>2. Credit 200.00 (Balance should be 1500.00)<br>3. View balance to verify cumulative effect | System displays final balance as 001500.00 | | | |
| TC-006 | Debit Account - Valid Amount | Application started; Balance is 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 300.00<br>3. Observe system response | System displays "Amount debited. New balance: 000700.00" | | | |
| TC-007 | Debit Account - Decimal Amount | Application started; Balance is 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 150.75<br>3. Observe system response | System displays "Amount debited. New balance: 000849.25" | | | |
| TC-008 | Debit Account - Insufficient Funds | Application started; Balance is 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 1500.00<br>3. Observe system response | System displays "Insufficient funds for this debit."<br>Balance remains 001000.00 | | | |
| TC-009 | Debit Account - Exact Balance | Application started; Balance is 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 1000.00<br>3. Observe system response | System displays "Amount debited. New balance: 000000.00" | | | |
| TC-010 | Debit Account - Partial Balance | Application started; Balance is 1000.00 | 1. Select option 3 (Debit Account)<br>2. Enter amount: 999.99<br>3. Observe system response | System displays "Amount debited. New balance: 000000.01" | | | |
| TC-011 | Debit Account - Multiple Debits | Application started; Balance is 1000.00 | 1. Debit 200.00 (Balance should be 800.00)<br>2. Debit 150.00 (Balance should be 650.00)<br>3. View balance to verify cumulative effect | System displays final balance as 000650.00 | | | |
| TC-012 | Debit After Credit | Application started; Balance is 1000.00 | 1. Credit 500.00 (Balance: 1500.00)<br>2. Debit 300.00 (Balance: 1200.00)<br>3. View balance to verify | System displays final balance as 001200.00 | | | |
| TC-013 | Invalid Menu Choice - Number Out of Range | Application displays menu | 1. Enter choice: 5<br>2. Observe system response<br>3. Verify menu redisplays | System displays "Invalid choice, please select 1-4."<br>Menu redisplays for next choice | | | |
| TC-014 | Invalid Menu Choice - Zero | Application displays menu | 1. Enter choice: 0<br>2. Observe system response<br>3. Verify menu redisplays | System displays "Invalid choice, please select 1-4."<br>Menu redisplays for next choice | | | |
| TC-015 | Invalid Menu Choice - Negative Number | Application displays menu | 1. Enter choice: -1<br>2. Observe system response<br>3. Verify menu redisplays | System displays "Invalid choice, please select 1-4."<br>Menu redisplays for next choice | | | |
| TC-016 | Menu Navigation - Multiple Operations | Application started; Balance is 1000.00 | 1. View balance (choice 1)<br>2. Credit 100 (choice 2)<br>3. View balance (choice 1)<br>4. Debit 50 (choice 3)<br>5. View balance (choice 1) | Each operation executes correctly<br>Final balance is 001050.00 | | | |
| TC-017 | Menu Navigation - Loop Continues | Application started | 1. Perform operation (choice 1, 2, or 3)<br>2. Menu redisplays<br>3. Repeat 3 times<br>4. Select exit (choice 4) | Menu continues to loop after each operation until exit is selected | | | |
| TC-018 | Exit Program - Normal Termination | Application displaying menu | 1. Select choice 4 (Exit)<br>2. Observe program termination | System displays "Exiting the program. Goodbye!"<br>Program terminates cleanly | | | |
| TC-019 | Balance Persistence Across Operations | Application started; Balance is 1000.00 | 1. Credit 250 (Balance: 1250.00)<br>2. Go back to menu<br>3. View balance | System maintains the credited balance of 001250.00 | | | |
| TC-020 | Boundary Test - Maximum Amount | Application started; Balance is 1000.00 | 1. Credit 999999.99 (Maximum 6-digit value)<br>2. Observe system response | System displays new balance or handles overflow appropriately | | | |

---

## Test Execution Notes

### High-Priority Test Cases
- TC-001: Validates system initialization
- TC-006: Core debit functionality
- TC-008: Critical validation (insufficient funds check)
- TC-018: Program exit behavior

### Medium-Priority Test Cases
- TC-002, TC-005: Credit functionality
- TC-011, TC-012: Transaction sequences
- TC-016, TC-017: Menu navigation

### Low-Priority Test Cases
- TC-003, TC-004, TC-007: Edge cases with amounts
- TC-013, TC-014, TC-015: Invalid input handling
- TC-020: Boundary testing

---

## Business Rules Covered

1. **Initial State**: Account starts with balance of 1000.00
2. **View Balance**: Display current account balance in format XXX000.00
3. **Credit Operation**: Add specified amount to current balance
4. **Debit Operation**: Subtract amount from balance only if sufficient funds exist
5. **Insufficient Funds Check**: Prevent negative balances; reject debit if amount > current balance
6. **Menu Loop**: Application continues until user selects exit (option 4)
7. **Input Validation**: Only accept menu choices 1-4; reject invalid input and redisplay menu
8. **Data Persistence**: Balance persists across operations within a session
9. **Clean Exit**: Program terminates gracefully when exit option is selected

---

## Migration Considerations for Node.js Implementation

This test plan is designed to be framework-agnostic and can be directly translated into Node.js unit and integration tests. Each test case can be implemented using:

- **Unit Tests**: Individual function testing for balance operations (credit, debit, view)
- **Integration Tests**: Menu flow, state management, and validation logic
- **Test Framework Suggestions**: Jest, Mocha, or Jasmine for Node.js implementation
