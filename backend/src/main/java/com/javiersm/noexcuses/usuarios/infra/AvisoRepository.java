package com.javiersm.noexcuses.usuarios.infra;
import com.javiersm.noexcuses.usuarios.dominio.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {}