package com.kinetrexa.expensetracker.expense;

import com.kinetrexa.expensetracker.auth.UserAccount;
import com.kinetrexa.expensetracker.auth.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public List<Expense> getAllExpenses(String email) {
        return expenseRepository.findAllByUserAccount_EmailOrderByDateDesc(email);
    }

    public Expense addExpense(Expense expense, String email) {
        UserAccount account = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow();

        expense.setUserAccount(account);
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id, String email) {
        Expense expense = expenseRepository.findByIdAndUserAccount_Email(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        expenseRepository.delete(expense);
    }
}