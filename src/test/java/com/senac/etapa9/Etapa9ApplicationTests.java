package com.senac.etapa9;

import com.senac.etapa9.data.FuncionarioRepository;
import com.senac.etapa9.model.Funcionario;
import com.senac.etapa9.service.FuncionarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class Etapa9ApplicationTests {

    private FuncionarioRepository funcionarioRepository;
    private FuncionarioService funcionarioService;

    @BeforeEach
    void configurar() {
        funcionarioRepository = Mockito.mock(FuncionarioRepository.class);
        funcionarioService = new FuncionarioService(funcionarioRepository);
    }

    @Test
    void deveCadastrarFuncionarioComSucesso() {

        Funcionario funcionario = new Funcionario();

        funcionario.setNome("João da Silva");
        funcionario.setCpf("12345678901");
        funcionario.setDataNascimento(
                LocalDate.of(1995, 5, 10)
        );
        funcionario.setCargo("Desenvolvedor");
        funcionario.setSalarioBase(
                new BigDecimal("3500.00")
        );
        funcionario.setStatus("ATIVO");

        when(funcionarioRepository.existsByCpf("12345678901"))
                .thenReturn(false);

        when(funcionarioRepository.save(funcionario))
                .thenReturn(funcionario);

        Funcionario resultado =
                funcionarioService.cadastrar(funcionario);

        assertNotNull(resultado);
        assertEquals("João da Silva", resultado.getNome());
        assertEquals("12345678901", resultado.getCpf());
        assertEquals("Desenvolvedor", resultado.getCargo());

        verify(funcionarioRepository, times(1))
                .existsByCpf("12345678901");

        verify(funcionarioRepository, times(1))
                .save(funcionario);
    }

    @Test
    void naoDeveCadastrarFuncionarioComCpfDuplicado() {

        Funcionario funcionario = new Funcionario();

        funcionario.setNome("Maria da Silva");
        funcionario.setCpf("12345678901");
        funcionario.setDataNascimento(
                LocalDate.of(1998, 8, 20)
        );
        funcionario.setCargo("Analista");
        funcionario.setSalarioBase(
                new BigDecimal("2800.00")
        );
        funcionario.setStatus("ATIVO");

        when(funcionarioRepository.existsByCpf("12345678901"))
                .thenReturn(true);

        IllegalArgumentException excecao =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> funcionarioService.cadastrar(funcionario)
                );

        assertEquals(
                "Já existe um funcionário cadastrado com esse CPF.",
                excecao.getMessage()
        );

        verify(funcionarioRepository, times(1))
                .existsByCpf("12345678901");

        verify(funcionarioRepository, never())
                .save(any(Funcionario.class));
    }
}