# Backend Documentation: Skills and Progression Tables

This document outlines the purpose, structure, and use of the `skills` and `skill_level_progression` tables within the SovereignQuest backend. These tables are critical components for managing skill-related data, progression systems, and interactions between characters and gameplay mechanics.

---

## **Purpose of This Documentation**
This document serves as a reference for developers working on the backend systems for SovereignQuest. It explains:

- The role of the individual tables.
- How these tables interact with other backend systems (e.g., character data, MongoDB collections).
- Best practices for adding, updating, and querying data.
- Example usage templates for consistent data management.

This documentation ensures that all team members understand how to effectively use these tables and integrate them into the game engine and frontend tools.


# Skills Table Documentation

## Purpose
The `skills` table is a core part of the backend database for managing skills in the SovereignQuest project. It centralizes all skill-related information, including basic attributes, complex effects, prerequisites, and subskill relationships. This table is designed to:

- Provide detailed data on each skill for use in the game engine and frontend.
- Allow flexible and scalable management of skill effects and restrictions.
- Enable referencing skills across characters, races, and other tables for seamless integration.

---

## Table Overview
### **Table Definition**
```sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- Skill name
    description TEXT NOT NULL,              -- General description
    base_modifier NUMERIC(5, 2) DEFAULT NULL, -- Optional base modifier
    effect_details JSONB DEFAULT NULL,      -- Optional complex effects
    requirements JSONB DEFAULT NULL,        -- Skill prerequisites (flexible JSON structure)
    parent_skill_id INT REFERENCES skills(id) ON DELETE CASCADE, -- For subskills
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Key Fields**
- **`id`**: Unique identifier for each skill.
- **`name`**: The name of the skill (e.g., "Sprinting").
- **`description`**: A brief explanation of the skill.
- **`base_modifier`**: A numeric value representing a simple effect modifier (e.g., `0.10` for a 10% boost).
- **`effect_details`**: A JSONB field for storing complex effects (e.g., crafting bonuses or special attack data).
- **`requirements`**: A JSONB field for prerequisites, such as race restrictions, devotion levels, or prior skills.
- **`parent_skill_id`**: The ID of the main skill for subskills (e.g., "Blunt Mastery" for "Shieldbreaker").
- **`last_updated`**: Tracks when the skill was last modified.

---

## Rules for Using the Table
### **Adding a New Skill**
- Ensure that the skill name and description clearly reflect its purpose.
- If the skill has a simple effect, include a `base_modifier`.
- For complex effects, use the `effect_details` field to specify unique behavior (e.g., crafting bonuses).
- If the skill has prerequisites, define them in the `requirements` JSONB field using the structure below:
  ```json
  {
    "racial_restriction": ["Elf", "Orc"],
    "devotional_requirement": { "god": "Pelor", "min": 50 },
    "prior_skills": [1, 2],
    "conditions": ["requires_shield_equipped"]
  }
  ```
- For subskills, link them to their parent skill using `parent_skill_id`.

### **Modifying a Skill**
- Use the `UPDATE` SQL command to modify fields. For example:
  ```sql
  UPDATE skills SET base_modifier = 0.15 WHERE id = 3;
  ```
- Update the `last_updated` field automatically by defining triggers in PostgreSQL if needed.

### **Deleting a Skill**
- Deleting a parent skill will automatically delete all its subskills due to the `ON DELETE CASCADE` rule.

---

## Relation to Other Tables
### **`character_skills` Table**
- Tracks which skills a character has, their levels, and current EXP.
- Skills are linked via the `skill_id` column.

### **`races` Collection (MongoDB)**
- The `racial_skills` field in the `races` collection references skills by their `id` in PostgreSQL.
- Allows dynamic querying of skill names and details for race selection or tooltips.

### **`skill_level_progression` Table**
- Defines EXP thresholds for leveling up skills.
- Linked to this table via `skill_id` to manage level-based effects dynamically.

---

## Example Usage
### **Adding a Skill**
```sql
INSERT INTO skills (name, description, base_modifier, effect_details, requirements) 
VALUES (
    'Shieldbreaker',
    'A powerful blunt weapon attack that reduces shield durability.',
    NULL,
    '{"special_attack": "Stun and reduce enemy's shield durability by 10%"}',
    '{"prior_skills": [1], "conditions": ["requires_blunt_weapon"]}'
);
```

### **Querying Skills for a Character**
```sql
SELECT s.name, s.description, cs.current_level, cs.current_exp
FROM character_skills cs
JOIN skills s ON cs.skill_id = s.id
WHERE cs.character_id = 42;
```

---

## Template for Adding a Skill
```sql
INSERT INTO skills (name, description, base_modifier, effect_details, requirements, parent_skill_id) 
VALUES (
    '<Skill Name>',
    '<Skill Description>',
    <Base Modifier or NULL>,
    '<Effect Details as JSON>'::jsonb,
    '<Requirements as JSON>'::jsonb,
    <Parent Skill ID or NULL>
);
```

Example:
```sql
INSERT INTO skills (name, description, base_modifier, effect_details, requirements, parent_skill_id) 
VALUES (
    'Elven Step',
    'Enhances movement speed and agility for elves.',
    0.10,
    NULL,
    '{"racial_restriction": ["Elf"]}'::jsonb,
    NULL
);


---

## **Skill Level Progression Table**
### **Purpose**
The `skill_level_progression` table defines the progression system for skills, specifying the cumulative experience (EXP) required to reach each level and associated rank details. This table ensures consistency in skill leveling and enables dynamic adjustments to progression systems.

### **Table Definition**
```sql
CREATE TABLE skill_level_progression (
    level INT PRIMARY KEY,        -- Skill level (0–90)
    rank VARCHAR(50),             -- Rank name (e.g., Novice, Initiate)
    rank_power INT,               -- Rank power (used in calculations)
    cumulative_exp BIGINT         -- Cumulative EXP required to reach this level
);
```

### **Key Fields**
- **`level`**: Skill level (e.g., 1, 2, ... 90).
- **`rank`**: Descriptive name for the skill rank (e.g., "Novice").
- **`rank_power`**: Numeric value representing rank power, used in gameplay calculations.
- **`cumulative_exp`**: Total experience points required to reach the corresponding level.

### **Examples**
#### Adding Level Progression Data
```sql
INSERT INTO skill_level_progression (level, rank, rank_power, cumulative_exp) VALUES
(0, 'N/A', 0, 0),
(1, 'Novice', 1, 1000),
(2, 'Novice', 1, 3000),
(3, 'Novice', 1, 6000),
(4, 'Novice', 1, 10000),
(5, 'Novice', 1, 15000);
```

#### Querying Level Requirements
```sql
SELECT level, rank, cumulative_exp
FROM skill_level_progression
WHERE level BETWEEN 1 AND 5;
```

### **Integration with Other Tables**
- **`character_skills` Table**:
  - Links a character’s skill levels to the progression thresholds in this table.
  - Enables dynamic queries to calculate required EXP for level-ups.

- **`skills` Table**:
  - References skill-level thresholds to dynamically adjust skill effects based on current level.

---

## **Best Practices**
1. **Centralize Skill Logic:**
   - Use the `skills` table for static skill data and the `skill_level_progression` table for dynamic leveling logic.
2. **Dynamic Queries:**
   - Leverage JSONB queries for complex skill requirements and effects.
3. **Keep Data Consistent:**
   - Ensure cumulative EXP in the `skill_level_progression` table is consistent with gameplay expectations.

---

## Templates
### **Skill Table Template**
```sql
INSERT INTO skills (name, description, base_modifier, effect_details, requirements, parent_skill_id) 
VALUES (
    '<Skill Name>',
    '<Skill Description>',
    <Base Modifier or NULL>,
    '<Effect Details as JSON>'::jsonb,
    '<Requirements as JSON>'::jsonb,
    <Parent Skill ID or NULL>
);
```

### **Skill Level Progression Template**
```sql
INSERT INTO skill_level_progression (level, rank, rank_power, cumulative_exp) VALUES
(<Level>, '<Rank>', <Rank Power>, <Cumulative EXP>);
