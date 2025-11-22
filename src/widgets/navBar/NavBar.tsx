import { AppBar, Toolbar, Button, Box, Typography, Menu, MenuItem, IconButton } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'

const NavBar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuth = useAuthStore((state) => state.isAuth)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openLangMenu = Boolean(anchorEl)

  const handleOpenLangMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseLangMenu = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    setAnchorEl(null)
  }

  const handleLoginClick = () => {
    const next = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?next=${next}`)
  }

  const handleRegisterClick = () => {
    navigate('/register')
  }

  const handleLogoutClick = async () => {
    await logout()
  }

  const lngs: Record<string, string> = {
    en: 'EN',
    ru: 'RU',
    kz: 'KZ',
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* logo / title */}
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Dara Til
        </Typography>

        {/* right side */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* language menu */}
          <IconButton color="inherit" onClick={handleOpenLangMenu}>
            <LanguageIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={openLangMenu} onClose={handleCloseLangMenu}>
            {Object.keys(lngs).map((lng) => (
              <MenuItem
                key={lng}
                selected={i18n.resolvedLanguage === lng}
                onClick={() => handleLanguageChange(lng)}
              >
                {lngs[lng]}
              </MenuItem>
            ))}
          </Menu>

          {/* auth buttons */}
          {isAuth && user ? (
            <>
              <Typography variant="body1">{user.username}</Typography>
              <Button color="inherit" onClick={handleLogoutClick}>
                {t('navbar.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={handleLoginClick}>
                {t('navbar.login')}
              </Button>
              <Button color="inherit" onClick={handleRegisterClick}>
                {t('navbar.register')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
