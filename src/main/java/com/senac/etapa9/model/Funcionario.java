package com.senac.etapa9.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "funcionarios")
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
    @Column(nullable = false, length = 120)
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @Pattern(
        regexp = "\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}",
        message = "Informe um CPF válido no formato 00000000000 ou 000.000.000-00."
    )
    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @NotNull(message = "A data de nascimento é obrigatória.")
    @Past(message = "A data de nascimento deve ser anterior à data atual.")
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @NotBlank(message = "O cargo é obrigatório.")
    @Size(max = 80, message = "O cargo deve ter no máximo 80 caracteres.")
    @Column(nullable = false, length = 80)
    private String cargo;

    @NotNull(message = "O salário é obrigatório.")
    @DecimalMin(value = "0.00", message = "O salário não pode ser negativo.")
    @Digits(integer = 10, fraction = 2, message = "Informe um salário com até 10 dígitos inteiros e 2 casas decimais.")
    @Column(name = "salario_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal salarioBase = BigDecimal.ZERO;

    @NotBlank(message = "O status é obrigatório.")
    @Pattern(regexp = "ATIVO|INATIVO", message = "O status deve ser ATIVO ou INATIVO.")
    @Column(nullable = false, length = 7)
    private String status = "ATIVO";

    public Funcionario() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public BigDecimal getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(BigDecimal salarioBase) {
        this.salarioBase = salarioBase;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
