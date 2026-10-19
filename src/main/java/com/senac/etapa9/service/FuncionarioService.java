package com.senac.etapa9.service;

import com.senac.etapa9.data.FuncionarioRepository;
import com.senac.etapa9.model.Funcionario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;

    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    public Funcionario buscarPorId(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Funcionário não encontrado."
                ));
    }

    @Transactional
    public Funcionario cadastrar(Funcionario funcionario) {
        funcionario.setId(null);

        if (funcionarioRepository.existsByCpf(funcionario.getCpf())) {
            throw new IllegalArgumentException(
                    "Já existe um funcionário cadastrado com esse CPF."
            );
        }

        return funcionarioRepository.save(funcionario);
    }

    @Transactional
    public Funcionario atualizar(Long id, Funcionario dados) {
        Funcionario funcionario = buscarPorId(id);

        boolean cpfDuplicado = funcionarioRepository.findAll().stream()
                .anyMatch(outro ->
                        !outro.getId().equals(id)
                        && outro.getCpf().equals(dados.getCpf())
                );

        if (cpfDuplicado) {
            throw new IllegalArgumentException(
                    "Esse CPF já pertence a outro funcionário."
            );
        }

        funcionario.setNome(dados.getNome());
        funcionario.setCpf(dados.getCpf());
        funcionario.setDataNascimento(dados.getDataNascimento());
        funcionario.setCargo(dados.getCargo());
        funcionario.setSalarioBase(dados.getSalarioBase());
        funcionario.setStatus(dados.getStatus());

        return funcionarioRepository.save(funcionario);
    }

    @Transactional
    public void excluir(Long id) {
        Funcionario funcionario = buscarPorId(id);
        funcionarioRepository.delete(funcionario);
    }
}
