package com.kinetrexa.expensetracker.expense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByUserAccount_EmailOrderByDateDesc(String email);

    Optional<Expense> findByIdAndUserAccount_Email(Long id, String email);
}