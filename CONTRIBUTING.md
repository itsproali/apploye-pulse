# Contributing to Apploye Pulse

Thank you for your interest in contributing to Apploye Pulse! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Chrome browser for testing

### Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/apploye-pulse.git
   cd apploye-pulse
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

5. Load the extension in Chrome (see README for instructions)

## 📝 How to Contribute

### Reporting Issues

- Use the GitHub issue tracker
- Provide clear description and steps to reproduce
- Include browser version and extension version
- Add screenshots if applicable

### Suggesting Features

- Open a discussion or issue with the "enhancement" label
- Describe the feature and its benefits
- Consider implementation complexity and user impact

### Code Contributions

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Ensure code follows the style guide
5. Submit a pull request

## 🎨 Code Style

### TypeScript

- Use strict typing
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow the existing component structure

### CSS/Styling

- Use Tailwind CSS classes
- Follow the existing design system
- Use CSS variables for theming
- Keep styles scoped to components

### File Organization

```bash
src/
├── components/     # Reusable UI components
├── contents/       # Content scripts
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── popup.tsx       # Extension popup
├── options.tsx     # Options page
└── background.ts   # Background script
```

## 🧪 Testing

### Manual Testing

- Test on different screen sizes
- Test with different Apploye data scenarios
- Test holiday management functionality
- Test month navigation

### Automated Testing

- Unit tests for utility functions
- Component tests for React components
- Integration tests for extension functionality

## 📋 Pull Request Process

1. **Fork and Branch**: Create a feature branch from `main`
2. **Code**: Implement your changes following the style guide
3. **Test**: Ensure all tests pass and manual testing is done
4. **Document**: Update documentation if needed
5. **Submit**: Create a pull request with a clear description

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] All tests pass

## Screenshots
Add screenshots if applicable

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🐛 Bug Reports

When reporting bugs, please include:

- **Browser version**: Chrome version and OS
- **Extension version**: Current version number
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

## 💡 Feature Requests

When suggesting features:

- **Use case**: Why is this feature needed?
- **User story**: How would users benefit?
- **Implementation ideas**: Any technical considerations?
- **Alternatives**: Other ways to solve the problem?

## 🏷️ Labels

We use labels to categorize issues and PRs:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested

## 📞 Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: <itsproali@gmail.com> for urgent matters

## 🎯 Development Priorities

1. **Bug fixes**: Critical issues affecting functionality
2. **Performance**: Optimizations and improvements
3. **Features**: New functionality based on user feedback
4. **Documentation**: Improving guides and examples
5. **Testing**: Increasing test coverage

## 📚 Resources

- [Plasmo Documentation](https://www.plasmo.com)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Apploye Pulse! 🎉
