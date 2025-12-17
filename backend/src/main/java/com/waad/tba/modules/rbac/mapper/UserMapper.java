package com.waad.tba.modules.rbac.mapper;

import com.waad.tba.modules.rbac.dto.*;
import com.waad.tba.modules.rbac.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    private final RoleMapper roleMapper;

    public UserMapper(RoleMapper roleMapper) {
        this.roleMapper = roleMapper;
    }

    public UserResponseDto toResponseDto(User user) {
        if (user == null) return null;
        
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .active(user.getActive())
                .roles(user.getRoles() != null ? 
                       user.getRoles().stream()
                           .map(roleMapper::toResponseDto)
                           .collect(Collectors.toList()) : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public User toEntity(UserCreateDto dto) {
        if (dto == null) return null;
        
        return User.builder()
                .username(dto.getUsername())
                .password(dto.getPassword()) // Will be encoded by service
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .active(true)
                .build();
    }

    public void updateEntityFromDto(User user, UserUpdateDto dto) {
        if (dto == null) return;
        
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        if (dto.getActive() != null) {
            user.setActive(dto.getActive());
        }
    }
}
