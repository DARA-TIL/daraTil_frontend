import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          homePage: {
            home: 'Home'
          },
          mapPage: {
            map: 'Map'
          },
          navbar: {
            login: 'Login',
            register: 'Register',
            logout: 'Logout'
          },
          auth: {
            loginTitle: 'Login',
            registerTitle: 'Create Account',

            name: 'Name',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',

            loginButton: 'Login',
            registerButton: 'Register',

            errors: {
              required: 'Required',
              invalidEmail: 'Invalid email format',
              min8: 'Minimum 8 characters',
              nameMin2: 'Minimum 2 characters',
              nameMax15: 'Maximum 15 characters',
              passwordsNotMatch: "Passwords don't match"
            }
          }
        }
      },
      ru: {
        translation: {
          homePage: {
            home: 'Главная'
          },
          mapPage: {
            map: 'Карта'
          },
          navbar: {
            login: 'Войти',
            register: 'Регистрация',
            logout: 'Выйти'
          },
          auth: {
            loginTitle: 'Вход',
            registerTitle: 'Создать аккаунт',

            name: 'Имя',
            email: 'Почта',
            password: 'Пароль',
            confirmPassword: 'Подтвердите пароль',

            loginButton: 'Войти',
            registerButton: 'Зарегистрироваться',

            errors: {
              required: 'Обязательное поле',
              invalidEmail: 'Неверный формат почты',
              min8: 'Минимум 8 символов',
              nameMin2: 'Минимум 2 символа',
              nameMax15: 'Максимум 15 символов',
              passwordsNotMatch: 'Пароли не совпадают'
            }
          }
        }
      },
      kz: {
        translation: {
          homePage: {
            home: 'Басты бет'
          },
          mapPage: {
            map: 'Карта'
          },
          navbar: {
            login: 'Кіру',
            register: 'Тіркелу',
            logout: 'Шығу'
          },
          auth: {
            loginTitle: 'Кіру',
            registerTitle: 'Тіркелу',

            name: 'Аты',
            email: 'Email',
            password: 'Құпия сөз',
            confirmPassword: 'Құпия сөзді растаңыз',

            loginButton: 'Кіру',
            registerButton: 'Тіркелу',

            errors: {
              required: 'Міндетті өріс',
              invalidEmail: 'Email дұрыс емес',
              min8: 'Кемінде 8 таңба',
              nameMin2: 'Кемінде 2 таңба',
              nameMax15: 'Ең көбі 15 таңба',
              passwordsNotMatch: 'Құпия сөздер сәйкес емес'
            }
          }
        }
      }
    }
  });

export default i18n;
