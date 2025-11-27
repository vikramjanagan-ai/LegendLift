# ⚡ LegendLift - Quick Reference Card

## 🚀 Quick Commands

### Start Backend
```bash
cd legendlift-backend && source venv/bin/activate && python run.py
```

### Start Mobile App
```bash
cd legendlift-mobile && npm start
```

### Run on iOS
```bash
cd legendlift-mobile && npm run ios
```

### Run on Android
```bash
cd legendlift-mobile && npm run android
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@legendlift.com | admin123 |
| Technician | tech@legendlift.com | tech123 |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/health |

---

## 🎨 Theme Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #4FC3F7 | Buttons, headers |
| Primary Dark | #0288D1 | Gradients |
| Primary Light | #B3E5FC | Backgrounds |
| Accent | #29B6F6 | Secondary actions |
| Success | #66BB6A | Completed status |
| Warning | #FFA726 | Pending status |
| Error | #EF5350 | Overdue status |

---

## 📁 Important Files

### Mobile App
```
src/constants/theme.js          # Theme configuration
src/constants/index.js           # App constants
src/store/index.js               # Redux store
src/navigation/RootNavigator.js  # Main navigation
App.js                           # Entry point
```

### Backend
```
app/main.py                      # FastAPI app
app/core/config.py               # Configuration
app/core/security.py             # JWT & auth
app/models/                      # Database models
app/api/endpoints/               # API routes
.env                             # Environment vars
```

---

## 🔧 Common Tasks

### Add New Screen (Mobile)
1. Create screen file: `src/screens/[role]/ScreenName.js`
2. Add to navigator: `src/navigation/[Role]Navigator.js`
3. Import components from: `src/components/common`

### Add New API Endpoint (Backend)
1. Add route: `app/api/endpoints/[resource].py`
2. Create schema: `app/schemas/[resource].py`
3. Add model (if needed): `app/models/[resource].py`
4. Register in: `app/main.py`

### Create New Redux Slice
1. Create file: `src/store/slices/[name]Slice.js`
2. Add to store: `src/store/index.js`
3. Use in components: `useSelector`, `useDispatch`

---

## 🐛 Debugging

### Backend Logs
```bash
# Check server logs
tail -f app.log

# Enable debug mode
DEBUG=True in .env
```

### Mobile App Logs
```bash
# Clear cache
npm start -- --clear

# View logs
npx react-native log-ios
npx react-native log-android
```

### Database
```bash
# Connect to database
psql -U postgres -d legendlift

# Common queries
SELECT * FROM users;
SELECT * FROM customers LIMIT 10;
\dt  # List tables
```

---

## 📦 Dependencies

### Add Mobile Dependency
```bash
cd legendlift-mobile
npm install [package-name]
```

### Add Backend Dependency
```bash
cd legendlift-backend
source venv/bin/activate
pip install [package-name]
pip freeze > requirements.txt
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/my-feature

# Create pull request (via GitHub/GitLab)
```

---

## 🧪 Testing

### Test Backend API
```bash
# Run all tests
pytest

# Run specific test
pytest tests/test_auth.py

# With coverage
pytest --cov=app
```

### Test Mobile App
```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

---

## 📱 Device Testing

### Android Emulator IPs
- **Localhost**: `http://10.0.2.2:8000/api/v1`
- **Computer IP**: `http://[YOUR_IP]:8000/api/v1`

### iOS Simulator
- **Localhost**: `http://localhost:8000/api/v1`

### Physical Device
- Use computer's IP address
- Ensure both on same network
- Backend must allow CORS from device IP

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -i :8000
kill -9 [PID]
```

### Metro Bundler Error
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### Database Connection Error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Module Not Found (Backend)
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📊 Monitoring

### Check API Health
```bash
curl http://localhost:8000/health
```

### View Active Sessions
```bash
# PostgreSQL
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Monitor Logs
```bash
# Backend
tail -f logs/app.log

# Mobile (iOS)
npx react-native log-ios

# Mobile (Android)
npx react-native log-android
```

---

## 🎯 Code Snippets

### Create New Component (Mobile)
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const MyComponent = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.paddingMD,
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: SIZES.body1,
    color: COLORS.textPrimary,
  },
});

export default MyComponent;
```

### Create API Endpoint (Backend)
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/items")
def get_items(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Your logic here
    return {"items": []}
```

---

## 📚 Resources

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Expo Docs**: https://docs.expo.dev/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Redux Toolkit**: https://redux-toolkit.js.org/

---

## 💡 Tips

1. **Always activate virtual environment** before running backend
2. **Clear cache** if seeing stale data in mobile app
3. **Use API docs** at /docs for testing endpoints
4. **Check logs** when debugging issues
5. **Use correct IP** for device testing
6. **Keep dependencies updated** regularly
7. **Follow naming conventions** in codebase

---

**Quick Help**: For detailed information, see SETUP_GUIDE.md and PROJECT_SUMMARY.md
