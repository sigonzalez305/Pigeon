package com.pigeon.messenger.dto;

import com.pigeon.messenger.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String phone;
    private String displayName;
    private String avatarUrl;
    private Long activePigeonId;

    public static UserDTO fromEntity(User user) {
        return new UserDTO(
            user.getId(),
            user.getPhone(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getActivePigeonId()
        );
    }
}
