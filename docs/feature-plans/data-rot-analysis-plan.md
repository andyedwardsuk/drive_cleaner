# Feature Implementation Plan: Data ROT Analysis & Hoarding Assessment

**Feature Name:** data-rot-analysis
**Complexity:** High (Novel concept, psychological metrics, visual design)
**Priority:** High (Unique differentiator)
**Module:** Full Stack + Visualization
**Estimated Effort:** 10-14 days

---

## 1. Feature Overview

**Description**: Analyze files using ROT (Redundant, Obsolete, Trivial) methodology from enterprise information governance, combined with psychological digital hoarding metrics, to create a visual "data rot" heatmap and personalized "Clutter Index" that gamifies cleanup.

**Core Innovation**: Apply enterprise data governance concepts (ROT analysis) to consumer/individual Drive management, visualizing "data gravity" - the phenomenon where data becomes harder to manage the longer it sits unused.

**Key Insight**: People understand physical clutter better than digital clutter. By making data "rot" visible (greyed out, dusty, textured like old paper), we create an emotional connection that motivates action.

**Psychological Foundation**: Based on Digital Hoarding Questionnaire (DHQ) research showing that:
- Visual representation of clutter increases perceived need for action
- Gamification (scores, progress bars) motivates behaviour change
- Comparing to peers/baselines creates social pressure for improvement

---

## 2. ROT Methodology

### Enterprise ROT Framework

| Category | Definition | Criteria | Action |
|----------|------------|----------|--------|
| **Redundant** | Duplicate or unnecessary copies | Multiple files with same name/content | Consolidate/Delete |
| **Obsolete** | Outdated, no longer relevant | Not accessed in 1+ years, superseded versions | Archive/Delete |
| **Trivial** | Low value, temporary | Screenshots, downloads, "Untitled" files, <10KB | Delete |

### Adapted for Personal Drive

**Redundant Files**:
- Exact duplicates (same name + size)
- Near-duplicates (e.g., "Budget v1", "Budget v2 final", "Budget FINAL FINAL")
- Multiple versions when latest should suffice

**Obsolete Files**:
- Not viewed in 12+ months
- Old versions superseded by newer (e.g., "Resume 2020" when "Resume 2024" exists)
- Files from completed projects (date-based detection)

**Trivial Files**:
- Screenshots with default names ("Screenshot 2024-01-15")
- Tiny files (<10KB, likely placeholders or failed downloads)
- "Untitled" documents
- Downloads folder items not moved within 30 days
- Temp files, cache files

---

## 3. Visual "Rot" Representation

### Rot Heatmap Visualization

Files visually "decay" based on age and access patterns:

```
Freshness Gradient:

Fresh (0-3 months)    → Vibrant color, sharp, clear
Aging (3-6 months)    → Slightly muted, subtle texture
Stale (6-12 months)   → Greyed, "dusty" overlay effect
Rotting (12-24 months)→ Heavy grey, old paper texture
Decayed (24+ months)  → Brownish grey, torn paper effect, dust particles
```

### Visual Design Elements

**CSS Effects**:
```css
/* Fresh file */
.file-fresh {
  opacity: 1;
  filter: none;
  background: linear-gradient(to right, #ffffff, #f9fafb);
}

/* Aging file (3-6 months) */
.file-aging {
  opacity: 0.95;
  filter: grayscale(10%);
  background: repeating-linear-gradient(
    45deg,
    #f9fafb,
    #f9fafb 10px,
    #f3f4f6 10px,
    #f3f4f6 20px
  );
}

/* Stale file (6-12 months) */
.file-stale {
  opacity: 0.85;
  filter: grayscale(30%);
  background: #e5e7eb;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

/* Rotting file (12-24 months) */
.file-rotting {
  opacity: 0.7;
  filter: grayscale(60%);
  background: #d1d5db;
  background-image:
    url('data:image/svg+xml,...'); /* Old paper texture */
  position: relative;
}

.file-rotting::after {
  content: "💀"; /* Skull emoji or dust icon */
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0.3;
}

/* Decayed file (24+ months) */
.file-decayed {
  opacity: 0.5;
  filter: grayscale(90%) sepia(20%);
  background: #9ca3af;
  background-image:
    url('data:image/svg+xml,...'), /* Torn paper edge */
    url('data:image/svg+xml,...'); /* Dust particles */
  position: relative;
  border: 1px dashed #6b7280;
}

.file-decayed::before {
  content: "☠️"; /* Skull & crossbones */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  opacity: 0.15;
}
```

### Interactive Heatmap

**Grid View Mode**:
```
┌────────────────────────────────────────────────────┐
│  Data Rot Heatmap                                  │
│  Viewing: All Files (sort by: Last Accessed)      │
└────────────────────────────────────────────────────┘

Color Key:  🟢 Fresh  🟡 Aging  🟠 Stale  🔴 Rotting  ⚫ Decayed

┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ 🟢  │ 🟢  │ 🟡  │ 🟡  │ 🟠  │ 🟠  │ 🔴  │ ⚫  │  Fresh → Old
│ Doc │ PDF │ XLS │ PPT │ IMG │ VID │ Doc │ Doc │
│ 2d  │ 5d  │ 98d │145d │ 8m  │11m  │18m  │ 3y  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

---

## 4. Digital Hoarding Assessment

### Hoarding Score Components

Based on Digital Hoarding Questionnaire (DHQ):

```javascript
function calculateHoardingScore(driveData) {
  const components = {
    // 1. Clutter Volume (0-25 points)
    clutter: calculateClutterScore(driveData.totalFiles, driveData.totalSize),

    // 2. Disorganization (0-25 points)
    disorganization: calculateDisorganizationScore(
      driveData.unlabelledFiles,
      driveData.duplicates,
      driveData.untitledFiles
    ),

    // 3. Digital Hoarding (0-25 points)
    accumulation: calculateAccumulationScore(
      driveData.oldFiles,
      driveData.trivialFiles,
      driveData.neverAccessedFiles
    ),

    // 4. Emotional Attachment (0-25 points)
    attachment: calculateAttachmentScore(
      driveData.deletionRate,       // Low deletion = high attachment
      driveData.archivalRate,        // Archiving instead of deleting
      driveData.multipleVersions     // Keeping all versions
    )
  };

  const totalScore = Object.values(components).reduce((a, b) => a + b, 0);

  return {
    totalScore,        // 0-100
    components,
    rating: getRating(totalScore),
    message: getMessage(totalScore)
  };
}

function getRating(score) {
  if (score <= 20) return { level: 'Minimal', color: 'green', icon: '✨' };
  if (score <= 40) return { level: 'Mild', color: 'blue', icon: '📂' };
  if (score <= 60) return { level: 'Moderate', color: 'yellow', icon: '📦' };
  if (score <= 80) return { level: 'Significant', color: 'orange', icon: '🗄️' };
  return { level: 'Severe', color: 'red', icon: '🚨' };
}
```

### Clutter Index Formula

**Clutter Index** = Weighted combination of:
- **ROT Ratio**: (Redundant + Obsolete + Trivial) / Total Files × 100
- **Data Gravity**: Average file age × File count / 365
- **Disorganization**: (Unlabelled + Duplicates + Untitled) / Total × 100
- **Inertia**: % of files not accessed in 1 year

```javascript
function calculateClutterIndex(data) {
  const rotRatio = (
    (data.redundant + data.obsolete + data.trivial) / data.total
  ) * 100;

  const dataGravity = (
    data.averageAgeDays * data.total
  ) / 365;

  const disorganization = (
    (data.unlabelled + data.duplicates + data.untitled) / data.total
  ) * 100;

  const inertia = (
    data.notAccessedOneYear / data.total
  ) * 100;

  // Weighted average
  const clutterIndex = (
    rotRatio * 0.4 +
    disorganization * 0.3 +
    inertia * 0.2 +
    Math.min(dataGravity / 100, 100) * 0.1
  );

  return {
    score: Math.round(clutterIndex),
    breakdown: { rotRatio, dataGravity, disorganization, inertia },
    target: 20  // Healthy clutter index < 20
  };
}
```

---

## 5. UI/UX Design

### Dashboard Widget

```jsx
<div className="data-rot-dashboard">
  {/* Clutter Index Gauge */}
  <ClutterGauge
    score={62}
    rating="Moderate"
    target={20}
    message="Your Drive has accumulated significant clutter. Target: <20."
  />

  {/* Hoarding Score Breakdown */}
  <HoardingScoreCard
    total={58}
    components={{
      clutter: 18,
      disorganization: 22,
      accumulation: 12,
      attachment: 6
    }}
  />

  {/* ROT Summary */}
  <ROTSummary
    redundant={{ count: 145, size: "2.3 GB" }}
    obsolete={{ count: 389, size: "5.1 GB" }}
    trivial={{ count: 234, size: "45 MB" }}
    totalSavings="7.4 GB"
  />

  {/* Data Gravity Visualization */}
  <DataGravityChart
    data={[
      { ageMonths: 0-6, count: 234, mass: 'light' },
      { ageMonths: 6-12, count: 189, mass: 'medium' },
      { ageMonths: 12-24, count: 412, mass: 'heavy' },
      { ageMonths: 24+, count: 567, mass: 'immovable' }
    ]}
  />

  {/* Quick Actions */}
  <QuickActions>
    <Button onClick={deleteTrivia}>Delete 234 Trivial Files (-45 MB)</Button>
    <Button onClick={archiveObsolete}>Archive 389 Obsolete Files</Button>
    <Button onClick={deduplicat}>Remove 145 Duplicates (-2.3 GB)</Button>
  </QuickActions>
</div>
```

### Rot Heatmap View

```jsx
<div className="rot-heatmap-view">
  <Hero
    title="Data Rot Heatmap"
    subtitle="Visualize file freshness. Darker = older and less accessed."
    icon={Thermometer}
  />

  {/* View Mode Toggle */}
  <ViewModeToggle>
    <option value="grid">Grid View (Heatmap)</option>
    <option value="list">List View (Sorted)</option>
    <option value="calendar">Calendar View (Timeline)</option>
  </ViewModeToggle>

  {/* Freshness Key */}
  <FreshnessKey>
    <KeyItem color="green" label="Fresh (0-3m)" />
    <KeyItem color="yellow" label="Aging (3-6m)" />
    <KeyItem color="orange" label="Stale (6-12m)" />
    <KeyItem color="red" label="Rotting (12-24m)" />
    <KeyItem color="black" label="Decayed (24m+)" />
  </FreshnessKey>

  {/* Heatmap Grid */}
  <HeatmapGrid files={files}>
    {files.map(file => (
      <FileCard
        key={file.id}
        file={file}
        rotLevel={calculateRotLevel(file.lastAccessed)}
        className={getRotClassName(file)}
        showDustEffect={file.ageMonths > 12}
        showSkullIcon={file.ageMonths > 24}
      />
    ))}
  </HeatmapGrid>
</div>
```

---

## 6. Gamification Elements

### Progress Tracking

**Clutter Reduction Progress**:
```
Your Clutter Index: 62 → 45 (-17 in 2 weeks!)

Progress to Target (20):
[████████░░░░░░░░] 38%

Next Milestone: Reach 40 (Delete 50 more old files)
Reward: "Data Minimalist" badge 🏅
```

**Achievements System**:
- 🧹 **Tidy Beginner**: Reduce clutter index by 10 points
- 🗑️ **Deletion Dynamo**: Delete 100 ROT files in one session
- 📉 **Hoarding Hero**: Drop hoarding score from Significant to Mild
- ✨ **Minimalist Master**: Maintain clutter index < 20 for 30 days
- 🌱 **Spring Cleaner**: Delete 1 GB+ of obsolete files

### Leaderboard (Optional)

**Anonymous Comparison**:
```
Your Clutter Index: 45
Average User: 58
Top 10%: <30

You're in the top 35% of organized users!
```

---

## 7. Backend Implementation

### New Analyzer: `rotAnalyzer.js`

```javascript
/**
 * Analyzes files for ROT (Redundant, Obsolete, Trivial) classification
 * @param {Array} filesData - All files
 * @returns {Object} ROT analysis results
 */
function analyzeROT(filesData) {
  return {
    redundant: findRedundantFiles(filesData),
    obsolete: findObsoleteFiles(filesData),
    trivial: findTrivialFiles(filesData),

    summary: {
      total_rot_files: 0,
      total_rot_size: 0,
      rot_percentage: 0
    },

    rot_by_type: {
      redundant: { count: 0, size: 0 },
      obsolete: { count: 0, size: 0 },
      trivial: { count: 0, size: 0 }
    }
  };
}

/**
 * Identifies redundant files (duplicates, multiple versions)
 */
function findRedundantFiles(filesData) {
  const duplicates = findDuplicates(filesData);
  const multipleVersions = findVersionedFiles(filesData);

  return {
    duplicates,
    versions: multipleVersions,
    count: duplicates.length + multipleVersions.length
  };
}

/**
 * Identifies obsolete files (not accessed in 12+ months)
 */
function findObsoleteFiles(filesData, thresholdMonths = 12) {
  const thresholdDate = new Date();
  thresholdDate.setMonth(thresholdDate.getMonth() - thresholdMonths);

  return filesData.filter(file => {
    const lastAccessed = new Date(file.last_viewed_date);
    return lastAccessed < thresholdDate;
  });
}

/**
 * Identifies trivial files (screenshots, tiny files, untitled)
 */
function findTrivialFiles(filesData) {
  const screenshots = filesData.filter(f =>
    /^Screenshot \d{4}-\d{2}-\d{2}/.test(f.file_name)
  );

  const tinyFiles = filesData.filter(f =>
    f.size_bytes < 10240  // < 10 KB
  );

  const untitled = filesData.filter(f =>
    /^Untitled/.test(f.file_name)
  );

  return { screenshots, tinyFiles, untitled };
}
```

### Clutter Index Calculator

```javascript
/**
 * Calculates comprehensive clutter and hoarding metrics
 */
function calculateClutterMetrics(filesData) {
  const rot = analyzeROT(filesData);

  return {
    clutter_index: calculateClutterIndex(filesData, rot),
    hoarding_score: calculateHoardingScore(filesData, rot),
    data_gravity: calculateDataGravity(filesData),
    freshness_distribution: calculateFreshnessDistribution(filesData)
  };
}
```

---

## 8. Implementation Tasks

### Phase 1: Backend ROT Analysis (3-4 days)
- [ ] Create \`rotAnalyzer.js\` with ROT detection logic
- [ ] Implement redundant file detection (duplicates, versions)
- [ ] Implement obsolete file detection (12+ months)
- [ ] Implement trivial file detection (screenshots, tiny, untitled)
- [ ] Calculate clutter index formula
- [ ] Calculate hoarding score (DHQ-based)
- [ ] Calculate data gravity metrics

### Phase 2: Visual Rot Effects (2-3 days)
- [ ] Design rot gradient CSS classes
- [ ] Create file card rot effects (greyscale, texture, opacity)
- [ ] Implement dust/decay overlays
- [ ] Add skull/warning icons for heavily rotted files
- [ ] Create freshness color key component

### Phase 3: Heatmap Visualization (2-3 days)
- [ ] Build heatmap grid layout
- [ ] Implement file sorting by freshness
- [ ] Add view mode toggle (grid, list, calendar)
- [ ] Create data gravity chart
- [ ] Interactive tooltips showing file age/access

### Phase 4: Gamification (2-3 days)
- [ ] Design clutter gauge component
- [ ] Build progress tracking system
- [ ] Implement achievements/badges
- [ ] Create hoarding score card
- [ ] Add comparison metrics (user vs average)

### Phase 5: Integration & Polish (1-2 days)
- [ ] Integrate with Smart Scan
- [ ] Add to dashboard as widget
- [ ] Create dedicated ROT Analysis view
- [ ] Testing and refinement
- [ ] Documentation

---

## 9. Success Criteria

### Functional
- [ ] ROT classification 90%+ accurate
- [ ] Clutter index formula validated
- [ ] Visual rot effects render smoothly
- [ ] Heatmap interactive and responsive
- [ ] Gamification motivates action

### Psychological
- [ ] Users understand "data rot" concept
- [ ] Visual decay creates emotional response
- [ ] Clutter index motivates cleanup
- [ ] Progress tracking sustains engagement

### Technical
- [ ] Performance: Analyze 1,000 files in <5s
- [ ] Visual effects don't slow rendering
- [ ] Accessible (screen readers describe rot levels)

---

## 10. Research Foundation

**Academic Basis**:
- Digital Hoarding Questionnaire (Neave et al., 2019)
- ROT methodology from ARMA International
- Data Gravity concept from McCrory (2010)

**Key Metrics**:
- DHQ subscales: Emotional attachment, Accumulation, Disorganization
- Information Lifecycle Management (ILM) principles
- Cognitive Load Theory (visual complexity affects decision-making)

---

**Total Effort**: 10-14 days
**Innovation Level**: High (Unique in consumer space)
**Market Differentiator**: Strong (Enterprise methodology + Consumer UX)
