import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: "johndoe", minLength: 3, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers and underscores",
  })
  username: string;

  @ApiProperty({ example: "Password123!", minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password too weak. Must contain uppercase, lowercase, number/special character",
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
  };

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
