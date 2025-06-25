# Contributing to SovereignQuest

Thank you for your interest in contributing to _SovereignQuest_! We welcome all skill levels and appreciate every contribution that helps improve our project. Please follow these guidelines to make the contribution process clear and effective for everyone.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branching and Workflow](#branching-and-workflow)
- [Development Guidelines](#development-guidelines)
- [Pull Requests](#pull-requests)
- [Issues and Project Management](#issues-and-project-management)
- [Contact](#contact)

---

### Getting Started

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/SovereignQuest.git
   ```

2. **Set Up Your Environment**:

   - Follow the instructions in the `README.md` file to install dependencies and configure your development environment.

3. **Identify Your First Task**:
   - All tasks are rated by their complexity, on a 1-5 scale. When selecting an issue to engage, check the labeled complexity and knowledge requirements first to ensure success.
   - For new contributors, check for issues labeled `good first issue` or `help wanted - 5`. These are beginner-friendly and good starting points.
   - If you have been assigned a particular task by a team lead, look for the issue tagged with the reference ID provided in your assignment message.

---

### Branching and Workflow

1. **Main Branches**:

   - `main`: The stable branch; all releases are merged here.
   - `develop`: Active development branch; base branch for feature branches.

2. **Creating Feature Branches**:

   - Name branches descriptively based on the task, using the following format:

     - **Features**: `feature/<short-description>`
     - **Bug Fixes**: `bugfix/<short-description>`
     - **Documentation**: `docs/<short-description>`

   - If the branch you need to open a pull request is not on the list above, please contact a team lead before adding it. Unauthorized branches will be removed.

3. **Branch Creation (Example)**:

   ```bash
   git checkout -b feature/add-authentication
   ```

4. **Keeping Your Branch Up to Date**:
   - Regularly pull updates from `develop` to keep your branch in sync:
     ```bash
     git pull origin develop
     ```

---

### Development Guidelines

1. **Coding Standards**:

   - **HTML/CSS**: Follow semantic HTML structure and use consistent naming conventions. For detailed formatting requirements, please refer to [HTML/CSS Formatting](formatting_requirements/HTML_CSS_FORMATTING.md).
   - **JavaScript**: Adhere to ES6+ standards. Use descriptive variable names and functional programming where possible. For detailed formatting requirements, please refer to [JS Formatting](formatting_requirements/JS_FORMATTING.md).
   - **Backend**: Maintain code modularity and ensure secure data handling.

2. **Linters and Formatters**:

   - Code must pass all linter checks. Ensure your setup runs our `.prettierrc` and `.eslintrc` configurations before committing.

3. **Commenting Code**:

   - Use comments to explain complex logic and highlight any workarounds. Keep comments clear and concise. For detailed commenting requirements, please refer to [COMMENTING REQUIREMENTS](formatting_requirements/COMMENTING_REQUIREMENTS.md).

4. **Writing Tests**:
   - If adding a new feature or fixing a bug, include tests in the `tests/` folder. Pull requests made to interactive modules will be rejected without working test file accompaniment. Refer to existing tests as examples.

---

### Pull Requests

1. **Creating a Pull Request**:

   - Open a pull request (PR) to `develop` for review. Use the following template for PRs:
     - **Title**: `[Feature] Add Authentication`
     - **Description**: Briefly explain the feature/fix, relevant issues, and any additional context.

2. **PR Checklist**:

   - [ ] Ensure the code passes all tests, and test files are included in PR.
   - [ ] Verify that code is formatted correctly.
   - [ ] Document any new functionality in the `README.md` if applicable.

3. **Requesting a Review**:

   - Tag at least one reviewer and address their feedback before the PR can be merged.

4. **Merging**:
   - Only team leads or reviewers can merge approved PRs.

---

### Issues and Project Management

1. **Reporting Issues**:

   - Create an issue with a clear title and description. Use labels like `bug`, `feature`, or `documentation`.

2. **Working on Issues**:

   - Comment on the issue to claim it. The issue will then be assigned to you. Claimed issues will be yours for one week following assignment. If more time is needed, please contact a team lead to extend your claim. Claimed issues that exceed the time limit will be reopened and can be claimed by another member of the team.

3. **Project Board**:
   - Check the project board for an overview of open, in-progress, and completed tasks. Move issues as you progress through them.

---

### **Working on an Issue**

Once you have been assigned an issue, follow these steps to complete it efficiently:

1. **Navigate to the GitHub Repository**:

   - Start by accessing the **SovereignQuest** repository on GitHub. Ensure that you're logged into your GitHub account.

2. **Clone the Repository**:

   - Clone the repository to your local machine if you haven’t already:
     ```bash
     git clone https://github.com/your-username/SovereignQuest.git
     ```
   - Navigate into the project directory:
     ```bash
     cd SovereignQuest
     ```

3. **Update Your Local Branch**:

   - Always begin by updating your local copy to include the latest changes from the `develop` branch:
     ```bash
     git checkout develop
     git pull origin develop
     ```

4. **Create a New Branch for the Issue**:

   - Create a new branch for your work. This helps isolate your changes until they are ready to be reviewed and merged. Use a descriptive name that corresponds to the issue:
     ```bash
     git checkout -b feature/issue-<issue-number>-<short-description>
     ```
     - For example: `feature/issue-101-add-user-auth`

5. **Work on the Issue**:

   - Open your code editor (e.g., **VS Code**), and start working on the assigned task.
   - Follow the **Development Guidelines** to ensure you adhere to the coding standards and best practices.
   - Regularly save your work, and frequently test small changes to verify functionality.
   - Use **ESLint** and **Prettier** to check for code style issues:
     ```bash
     npm run lint
     npm run format
     ```

6. **Commit Changes**:

   - Once you’ve made significant progress or completed the issue, **commit** your changes.
   - Write descriptive commit messages following best practices:
     ```bash
     git add .
     git commit -m "Implemented user registration flow (#<issue-number>)"
     ```
   - Make **small, frequent commits** rather than one large commit. This helps reviewers understand each change more easily.

7. **Push Your Branch to GitHub**:

   - Push your branch to GitHub to back up your work and prepare for a pull request:
     ```bash
     git push origin feature/issue-<issue-number>-<short-description>
     ```

8. **Create a Pull Request (PR)**:

   - Navigate to the repository page on GitHub.
   - Click **Compare & Pull Request**.
   - Select the `develop` branch as the base, and your feature branch as the compare branch.
   - Fill in the [PULL_REQUEST_TEMPLATE](//.github/PULL_REQUEST_TEMPLATE.md) that was set up for the repository:
     - **Title**: Provide a meaningful title related to the issue.
     - **Description**: Include details about what was done, reference the issue number (e.g., `Resolves #101`), and provide context if needed.
   - Ensure that all items in the PR checklist are checked:
     - [ ] **Code passes all tests.**
     - [ ] **Code adheres to style requirements.**
     - [ ] **New functionality is documented in `README.md` if necessary.**

9. **Request a Review**:

   - Tag at least one reviewer, usually a senior team member or a lead, for feedback.
   - You can also @mention any team lead if further discussion is needed on the pull request.

10. **Address Feedback**:

    - Be ready to address any review comments. You may need to make additional commits to your branch based on feedback.
    - Once changes are made, **push** them to your branch:
      ```bash
      git add .
      git commit -m "Addressed review comments on registration flow"
      git push origin feature/issue-<issue-number>-<short-description>
      ```

11. **Merge the Pull Request**:

    - Once your PR is approved, a team lead or reviewer will merge it into the `develop` branch.
    - If you have permissions, **do not** merge your PR until you have received approval.

12. **Delete Your Branch**:
    - After your PR has been merged, delete your local and remote branches to keep things tidy:
      ```bash
      git branch -d feature/issue-<issue-number>-<short-description>
      git push origin --delete feature/issue-<issue-number>-<short-description>
      ```

### **Summary of Workflow**

- Clone or pull the latest changes.
- Create a branch named after the issue.
- Make and test changes locally.
- Push the branch and create a pull request.
- Tag a reviewer and address feedback.
- Delete your feature branch after merging.

---

### Contact

If you have questions or need guidance, feel free to reach out to a team lead. We’re here to help make your contribution experience as smooth as possible!

---

Thank you for contributing to _SovereignQuest_!
