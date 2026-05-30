// esha.ai - Compiler Pipeline Simulator & Playground Core
// Powered by modern ESM, JSZip, and reactive vanilla state management

const STAGE_METADATA = [
  { id: 1, name: "Intent Extractor", tag: "Stage 1", desc: "NL Request → Intent JSON" },
  { id: 2, name: "Clarifier Agent", tag: "Stage 2", desc: "Intent Completeness Audit" },
  { id: 3, name: "System Designer", tag: "Stage 3", desc: "Module & RBAC Architecture" },
  { id: 4, name: "DB Generator", tag: "Stage 4", desc: "Normalized Relational DDL" },
  { id: 5, name: "API Generator", tag: "Stage 5", desc: "REST Endpoints Mapping" },
  { id: 6, name: "UI Generator", tag: "Stage 6", desc: "Declarative Pages & Forms" },
  { id: 7, name: "Auth Generator", tag: "Stage 7", desc: "Fine-Grained RBAC Policies" },
  { id: 8, name: "Business Logic", tag: "Stage 8", desc: "Deterministic Middleware Rules" },
  { id: 9, name: "Cross Validator", tag: "Stage 9", desc: "Consistency Auditor" },
  { id: 10, name: "Patch Generator", tag: "Stage 10", desc: "Surgical Repair Operations" },
  { id: 11, name: "Targeted Regenerator", tag: "Stage 11", desc: "Incremental Patch Application" },
  { id: 12, name: "Runtime Contracts", tag: "Stage 12", desc: "SQL DDL, Express, Casbin, React" },
  { id: 13, name: "Execution Simulator", tag: "Stage 13", desc: "Dry-Run Pipeline Executor" },
  { id: 14, name: "Dataset Generator", tag: "Stage 14", desc: "Benchmark Evaluation" },
  { id: 15, name: "Tradeoff Analyzer", tag: "Stage 15", desc: "Cost, Latency & Skip Optimization" }
];

// Complete 10 SaaS Production Product Prompts + 10 Adversarial Edge Case Benchmarks
const PRODUCT_BENCHMARKS = [
  { id: "P1", name: "E-Commerce Marketplace", domain: "Retail & Marketplaces", prompt: "Build an e-commerce platform with buyers, sellers, and an admin. Buyers can purchase items and write reviews. Sellers can list items. Admin can ban users and delete reviews.", entities: ["users", "items", "orders", "reviews"], roles: ["buyer", "seller", "admin"], expected: "Normalize items, reviews, and orders tables. Secure checkout stubs.", failures: ["Circular checkout dependency", "Payment gateway race conditions"] },
  { id: "P2", name: "Kanban Task Board", domain: "Collaboration Systems", prompt: "Build a collaborative project management board where managers can create workspaces and invite members. Members can add cards, move cards across Swimlanes (To Do, In Progress, Done), and attach comments. Guest users can only view.", entities: ["users", "workspaces", "cards", "swimlanes", "comments"], roles: ["manager", "member", "guest"], expected: "Swimlane updates, workspace models, card commenting boundaries.", failures: ["Workspace member leaks", "Circular dependency in drag-drop logs"] },
  { id: "P3", name: "Clinic Scheduler", domain: "Healthcare Systems", prompt: "Create an online clinic booking app. Patients can book sessions with doctors. Doctors can specify their weekly slots and write e-prescriptions. Receptionists can reschedule bookings and charge payments.", entities: ["users", "doctors", "patients", "appointments", "prescriptions", "payments"], roles: ["patient", "doctor", "receptionist"], expected: "Relational calendar slots, prescription ledgers, patient checkout forms.", failures: ["Double scheduling booking race condition"] },
  { id: "P4", name: "Real Estate Brokerage", domain: "Property Marketplaces", prompt: "Build a property listing portal. Agents can upload listings with pricing and pictures. Buyers can save listings, send inquiries, and schedule physical visits. Admin audits all listings before publishing.", entities: ["users", "properties", "inquiries", "visits", "reviews"], roles: ["agent", "buyer", "admin"], expected: "Verify properties list with status flags; map agents to buyer inquiries.", failures: ["Unchecked property publication bypasses audit"] },
  { id: "P5", name: "LMS Learning Portal", domain: "EdTech & Courses", prompt: "Create a learning management system. Instructors create courses and add video lectures. Students enroll, view videos, and submit quizzes. Grading is automated based on multiple-choice scores.", entities: ["users", "courses", "lectures", "enrollments", "quizzes", "scores"], roles: ["instructor", "student", "admin"], expected: "Establish quiz scoring ledger; check student video views stubs.", failures: ["Quiz results write-leak between students"] },
  { id: "P6", name: "Fitness Activity Logger", domain: "Fitness & Health", prompt: "Build a fitness tracking app. Users log workouts (cardio, weights) and trace daily calories. Trainers can view client workout logs, leave feedback, and assign custom diet plan logs.", entities: ["users", "workouts", "logs", "calories", "feedbacks", "diets"], roles: ["trainer", "client", "admin"], expected: "Calculate daily calorie totals dynamically; secure workouts logs.", failures: ["Trainer feedback maps to unassigned client workouts"] },
  { id: "P7", name: "Helpdesk Ticketing", domain: "Customer Support", prompt: "Build a support helpdesk. Customers create support tickets with severity. Agents claim tickets, post updates, and change status. Managers review average resolution times and assign tickets.", entities: ["users", "tickets", "messages", "assignments", "metrics"], roles: ["customer", "agent", "manager"], expected: "Auto-assign ticket status; build message comment timelines.", failures: ["Double agent assignment concurrency conflict"] },
  { id: "P8", name: "Event Booking Hub", domain: "Ticketing & Events", prompt: "Create an event booking site. Hosts create events with ticket inventory. Attendees buy tickets and write reviews. Admin handles payouts to hosts and processes cancellation refunds.", entities: ["users", "events", "tickets", "payouts", "refunds"], roles: ["host", "attendee", "admin"], expected: "Track ticket quantities; secure payout records; build event lists.", failures: ["Ticket inventory overbooking under high traffic load"] },
  { id: "P9", name: "Split Ledger Splitwise", domain: "Personal Finance", prompt: "Build a shared expense tracker. Group members create expense logs, tag members, and split costs evenly. The system dynamically calculates balances and records settle-up payments.", entities: ["users", "groups", "expenses", "splits", "payments"], roles: ["member", "admin"], expected: "Calculate net settle-up balances; build expense splits mappings.", failures: ["Negative splits circular balance loop"] },
  { id: "P10", name: "Inventory Control ERP", domain: "Enterprise Logistics", prompt: "Build an inventory management app. Warehouse managers log stock items, record shipments, and raise reorder flags when stock is low. Suppliers view reorder logs and update delivery status.", entities: ["users", "items", "stocks", "shipments", "suppliers", "reorders"], roles: ["manager", "supplier", "admin"], expected: "Validate reorder logic flags; record warehouse stock shifts.", failures: ["Low stock reorder flag fails to trigger at limit boundary"] }
];

const EDGE_BENCHMARKS = [
  { id: "E1", name: "Minimal Vague Prompt", edge_type: "Vague Request", prompt: "Make a cool website with logs and stuff.", expected: "Sets requires_clarification: true in Stage 1. Pauses at Stage 2 showing Targeted questions modal.", failures: ["Compiler crash due to empty table schema structure"] },
  { id: "E2", name: "Circular Logical Loop", edge_type: "Conflicting Requirements", prompt: "Build an e-commerce marketplace where checkout creates review items but reviews block completed checkouts, and reviews can never be written.", expected: "Validator (Stage 9) catches circular logical reference. Triggers block overlay after 3 attempts.", failures: ["Infinite compiler verification loop"] },
  { id: "E3", name: "Stateless Ledger Account", edge_type: "Incomplete Requirements", prompt: "Build a subscription billing ledger but do not store customer records anywhere.", expected: "Compiler generates custom relation structures by injecting guest columns to bypass FK blocks.", failures: ["Orphan billing entries lack references"] },
  { id: "E4", name: "Monolithic Overload", edge_type: "Scope Overloaded", prompt: "Build a full Facebook, Amazon, Slack, and Salesforce clone inside a single page.", expected: "Pulls entities under logical modules; trims scope warning flags.", failures: ["Entity count overflow; modules cross-reference block"] },
  { id: "E5", name: "Ambiguous Permission Boundaries", edge_type: "Ambiguous Roles", prompt: "Build a blog where everyone has full admin access but some authors can only read logs.", expected: "Validator triggers warning for overlapping permissions and forces default-deny policy rules.", failures: ["Admin scope leakage to guest authors"] },
  { id: "E6", name: "Stateless Activity Log", edge_type: "Stateless Database", prompt: "Build a social network but do not write any database entries or posts to disk.", expected: "Architects memory cache queues modules; throws warning for database data persistence rules.", failures: ["Data loss on cache queue overflow"] },
  { id: "E7", name: "Gateway Mismatch", edge_type: "External Services", prompt: "Build checkout app with Stripe, PayPal, and Crypto but no currency cash ledger.", expected: "Generates generic non-functional gateway adapters; flags warnings for currency formats.", failures: ["Failed payment ledger balancing"] },
  { id: "E8", name: "Undefined Route Maps", edge_type: "Access Routes Mismatch", prompt: "LMS where students can delete courses but instructors can only view log files.", expected: "Cross Validator catches student route anomalies; Stage 10 patches student access rules.", failures: ["Student credential privilege escalation"] },
  { id: "E9", name: "Circular Seeding Mismatch", edge_type: "Foreign Key Seeds Conflict", prompt: "Table A requires foreign key from B at insert time, but Table B requires PK from A at seed.", expected: "Validator identifies circular FK insert order; separates seeding steps into incremental updates.", failures: ["SQL Seeding fails due to constraint blocks"] },
  { id: "E10", name: "Keyless Ledger Audit", edge_type: "Missing Identifiers", prompt: "Build an audit ledger table with no id key columns or timestamp logs.", expected: "DB Schema Generator enforces standard relational models; injects UUID primary keys.", failures: ["Orphan duplicate records cannot be searched"] }
];

// Map templates object for compatibility
const APP_TEMPLATES = {
  ecommerce: PRODUCT_BENCHMARKS[0],
  kanban: PRODUCT_BENCHMARKS[1],
  medical: PRODUCT_BENCHMARKS[2],
  vague: EDGE_BENCHMARKS[0]
};

// Global App State
const state = {
  activeStage: 1,
  selectedTemplate: "ecommerce",
  selectedMode: "reliable", // fast | reliable | debug
  isCompiling: false,
  useClaudeAPI: false,
  apiKey: "",
  proxyType: "public", // default is public CORS proxy
  customProxyUrl: "",
  userPrompt: APP_TEMPLATES.ecommerce.prompt,
  stages: {},
  validatorViolations: [],
  repairAttempts: 0,
  maxRepairAttempts: 3,
  clarifierAnswers: { q1: "", q2: "", q3: "" },
  stageMetrics: {}, // Tracks latency, tokens, cost per run
  metrics: {
    successRate: 98.4,
    avgLatency: 4850,
    p95Latency: 8200,
    avgRepairs: 0.6,
    repairEffectiveness: 92.5,
    costPerRun: 0.045
  },
  dirtyFromStage: null
};

// Helper utilities
const delay = ms => new Promise(res => setTimeout(res, ms));

// Dynamic Procedural Keyword Parser for Custom Prompts
function parseCustomPrompt(prompt) {
  const normalized = prompt.toLowerCase();
  
  // Scans for popular SaaS concepts
  if (normalized.includes("e-commerce") || normalized.includes("shop") || normalized.includes("buy") || normalized.includes("sell")) {
    return PRODUCT_BENCHMARKS[0];
  }
  if (normalized.includes("kanban") || normalized.includes("task") || normalized.includes("project") || normalized.includes("board")) {
    return PRODUCT_BENCHMARKS[1];
  }
  if (normalized.includes("clinic") || normalized.includes("doctor") || normalized.includes("book") || normalized.includes("scheduler")) {
    return PRODUCT_BENCHMARKS[2];
  }
  if (normalized.includes("real") || normalized.includes("property") || normalized.includes("agent") || normalized.includes("listing")) {
    return PRODUCT_BENCHMARKS[3];
  }
  if (normalized.includes("course") || normalized.includes("lms") || normalized.includes("student") || normalized.includes("learn")) {
    return PRODUCT_BENCHMARKS[4];
  }
  if (normalized.includes("fitness") || normalized.includes("workout") || normalized.includes("track") || normalized.includes("trainer")) {
    return PRODUCT_BENCHMARKS[5];
  }
  if (normalized.includes("support") || normalized.includes("ticket") || normalized.includes("agent") || normalized.includes("helpdesk")) {
    return PRODUCT_BENCHMARKS[6];
  }
  if (normalized.includes("split") || normalized.includes("splitwise") || normalized.includes("expense") || normalized.includes("finance")) {
    return PRODUCT_BENCHMARKS[8];
  }

  // Fallback for custom prompt: Dynamic keywords extraction
  const nouns = [];
  const words = normalized.split(/\s+/);
  words.forEach(w => {
    if (w.length > 4 && !["build", "create", "website", "platform", "system", "application"].includes(w)) {
      nouns.push(w.replace(/[^a-z]/g, ""));
    }
  });

  const parsedEntities = ["users", nouns[0] || "records", nouns[1] || "logs", nouns[2] || "actions"].slice(0, 4);
  const parsedRoles = [nouns[0] ? nouns[0].slice(0, -1) : "member", "admin"];
  
  return {
    name: "Custom Software Application",
    prompt: prompt,
    entities: parsedEntities,
    roles: parsedRoles,
    features: [
      { id: "f1", name: `${parsedEntities[1].toUpperCase()} Management`, desc: `Allow roles to create and log ${parsedEntities[1]} details.`, role_scope: parsedRoles },
      { id: "f2", name: `${parsedEntities[2].toUpperCase()} Log Timelines`, desc: `Allows auditing of ${parsedEntities[2]} structures.`, role_scope: ["admin"] }
    ]
  };
}

// Procedural Generator Engine
const ProceduralGenerator = {
  1: (prompt, config) => {
    const isVague = prompt.toLowerCase().includes("vague") || prompt.toLowerCase().split(' ').length < 6;
    if (isVague) {
      return {
        app_name: "Undefined App",
        summary: "Prompt is too generic to extract meaningful intent structure.",
        requires_clarification: true,
        entities: [],
        roles: [],
        features: [],
        constraints: [],
        assumptions: [
          { field: "entities", assumed_value: "none", reason: "Fewer than 2 entities can be inferred from input" }
        ],
        open_questions: [
          { question: "What is the primary domain of this application?", impact: "Cannot build DB tables without knowing domain entities" },
          { question: "What roles are supported and what are their permission boundaries?", impact: "RBAC layer requires explicit role declarations" },
          { question: "What external services or gateways should be integrated?", impact: "Affects non-functional modules design" }
        ]
      };
    }

    return {
      app_name: config.name,
      summary: `Automated compiler intent specification for ${config.name}.`,
      requires_clarification: false,
      entities: config.entities.map(e => ({
        name: e,
        description: `Entity representing core ${e} business records`,
        attributes: ["id", "created_at", "updated_at", "deleted_at", e === "users" ? "email" : "name"]
      })),
      roles: config.roles.map(r => ({
        name: r,
        permissions_summary: `Authorized to perform actions relevant to the ${r} persona`
      })),
      features: config.features,
      constraints: [
        { type: "security", description: "All database writes must trigger audited RBAC validation logs" }
      ],
      assumptions: [
        { field: "auth_strategy", assumed_value: "JWT Bearer Token", reason: "Standard session management matches intent" }
      ],
      open_questions: []
    };
  },

  2: (intent) => {
    if (intent.requires_clarification) {
      return {
        proceed: false,
        questions: intent.open_questions.map((oq, index) => ({
          id: `q${index + 1}`,
          question: oq.question,
          affects: ["db", "api", "auth", "ui"]
        })),
        assumptions: [],
        proceed_risk: "high",
        proceed_risk_reason: "Stage 3 will fail immediately because of empty intent configurations."
      };
    }

    return {
      proceed: true,
      questions: [],
      assumptions: [
        { id: "a1", assumption: "Stateless RBAC token auth", affects: ["auth", "api"], confidence: "high" }
      ],
      proceed_risk: "none",
      proceed_risk_reason: null
    };
  },

  3: (intent) => {
    return {
      modules: [
        { id: "mod_core", name: "Core Module", responsibilities: ["Identity management", "User sessions"], depends_on: [], feature_ids: [] },
        ...intent.features.map((f, i) => ({
          id: `mod_${f.id}`,
          name: `${f.name} Module`,
          responsibilities: [f.desc],
          depends_on: ["mod_core"],
          feature_ids: [f.id]
        }))
      ],
      data_flows: intent.features.map((f, i) => ({
        id: `df_${f.id}`,
        trigger: `User invokes ${f.name}`,
        source_entity: "users",
        target_entity: intent.entities[1] ? intent.entities[1].name : "users",
        steps: [`Authenticate request`, `Validate authorization permissions`, `Execute database transaction`, `Return results`],
        involved_roles: f.role_scope
      })),
      role_matrix: intent.roles.map(r => ({
        role: r.name,
        can_read: intent.entities.map(e => e.name),
        can_write: r.name === "admin" ? intent.entities.map(e => e.name) : [intent.entities[1] ? intent.entities[1].name : "users"],
        can_delete: r.name === "admin" ? intent.entities.map(e => e.name) : [],
        can_admin: r.name === "admin" ? ["all"] : []
      })),
      business_rules: [
        { id: "br1", description: "Records must be logically soft-deleted using updated_at and deleted_at columns", enforced_at: "api" }
      ],
      non_functionals: {
        auth_strategy: "JWT Bearer Tokens with RSA-256 signatures",
        data_retention: "Soft-deleted entries are preserved indefinitely; hard purge occurs after 365 days",
        rate_limiting: "Maximum 100 requests per minute per IP address",
        other: []
      },
      assumptions: []
    };
  },

  4: (architecture, config) => {
    const warnings = [];
    const tables = config.entities.map(ent => {
      const isUser = ent === "users";
      const columns = [
        { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", unique: true },
        { name: "created_at", type: "timestamp with time zone", nullable: false, default: "now()", unique: false },
        { name: "updated_at", type: "timestamp with time zone", nullable: false, default: "now()", unique: false },
        { name: "deleted_at", type: "timestamp with time zone", nullable: true, default: "null", unique: false }
      ];

      if (isUser) {
        columns.push(
          { name: "email", type: "varchar(255)", nullable: false, default: "null", unique: true },
          { name: "role", type: "varchar(50)", nullable: false, default: "'buyer'", unique: false }
        );
      } else {
        columns.push(
          { name: "name", type: "varchar(255)", nullable: false, default: "null", unique: false },
          { name: "user_id", type: "uuid", nullable: false, default: "null", unique: false }
        );
      }

      const foreign_keys = isUser ? [] : [
        { column: "user_id", references_table: "users", references_column: "id" }
      ];

      return {
        id: `tb_${ent}`,
        name: ent,
        module_id: "mod_core",
        columns: columns,
        primary_key: "id",
        foreign_keys: foreign_keys,
        indexes: [
          { name: `idx_${ent}_deleted_at`, columns: ["deleted_at"], unique: false }
        ]
      };
    });

    return {
      tables: tables,
      validation_warnings: warnings
    };
  },

  5: (architecture, dbSchema, config) => {
    const endpoints = [];
    dbSchema.tables.forEach(table => {
      const allowedRoles = config.roles.map(r => r);
      
      endpoints.push({
        id: `ep_create_${table.name}`,
        path: `/api/v1/${table.name}`,
        method: "POST",
        module_id: "mod_core",
        table_id: table.id,
        auth_required: true,
        allowed_roles: allowedRoles,
        request: {
          params: [],
          query: [],
          body: table.columns.filter(c => c.name !== "id" && c.name !== "created_at" && c.name !== "updated_at" && c.name !== "deleted_at").map(c => ({
            field: c.name,
            type: c.type.includes("varchar") ? "string" : c.type,
            required: !c.nullable,
            db_column: c.name
          }))
        },
        response: {
          success_status: 201,
          fields: table.columns.map(c => ({ field: c.name, type: c.type, db_column: c.name }))
        },
        errors: [
          { status: 400, code: "INVALID_FIELD_ERROR", condition: "Field constraints violated" }
        ]
      });

      endpoints.push({
        id: `ep_list_${table.name}`,
        path: `/api/v1/${table.name}`,
        method: "GET",
        module_id: "mod_core",
        table_id: table.id,
        auth_required: true,
        allowed_roles: allowedRoles,
        request: {
          params: [],
          query: [
            { field: "page", type: "integer", required: false, db_column: null }
          ],
          body: []
        },
        response: {
          success_status: 200,
          fields: [
            { field: "data", type: "array", db_column: null }
          ]
        },
        errors: []
      });

      endpoints.push({
        id: `ep_delete_${table.name}`,
        path: `/api/v1/${table.name}/:id`,
        method: "DELETE",
        module_id: "mod_core",
        table_id: table.id,
        auth_required: true,
        allowed_roles: allowedRoles,
        request: {
          params: [{ field: "id", type: "uuid", required: true, db_column: "id" }],
          query: [],
          body: []
        },
        response: {
          success_status: 200,
          fields: [{ field: "success", type: "boolean", db_column: null }]
        },
        errors: []
      });
    });

    return {
      endpoints: endpoints,
      coverage_gaps: []
    };
  },

  6: (architecture, apiSchema, config) => {
    const pages = config.entities.map(ent => {
      const listEp = apiSchema.endpoints.find(e => e.id === `ep_list_${ent}`);
      const createEp = apiSchema.endpoints.find(e => e.id === `ep_create_${ent}`);
      const deleteEp = apiSchema.endpoints.find(e => e.id === `ep_delete_${ent}`);

      return {
        id: `pg_${ent}`,
        name: `${ent.charAt(0).toUpperCase() + ent.slice(1)} Dashboard`,
        route: `/${ent}`,
        allowed_roles: config.roles,
        workflow_id: `df_f1`,
        layout: "dashboard",
        components: [
          {
            id: `comp_${ent}_table`,
            type: "table",
            label: `All ${ent}`,
            endpoint_id: listEp ? listEp.id : "",
            fields: listEp ? [
              { name: "id", api_field: "id", input_type: "text", required: true, visible_to_roles: config.roles }
            ] : [],
            actions: [
              { label: "Delete", type: "delete", endpoint_id: deleteEp ? deleteEp.id : "", confirm_required: true }
            ]
          },
          {
            id: `comp_${ent}_form`,
            type: "form",
            label: `Add New ${ent.slice(0, -1)}`,
            endpoint_id: createEp ? createEp.id : "",
            fields: createEp ? createEp.request.body.map(f => ({
              name: f.field,
              api_field: f.field,
              input_type: f.type === "string" ? "text" : "number",
              required: f.required,
              visible_to_roles: config.roles
            })) : [],
            actions: [
              { label: "Submit", type: "submit", endpoint_id: createEp ? createEp.id : "", confirm_required: false }
            ]
          }
        ]
      };
    });

    return {
      pages: pages,
      validation_warnings: []
    };
  },

  7: (architecture, apiSchema, config) => {
    const roles = config.roles.map(r => ({
      id: `role_${r}`,
      name: r,
      inherits_from: null,
      description: `Fine-grained authorization context for ${r} users`
    }));

    const policies = [];
    apiSchema.endpoints.forEach(ep => {
      config.roles.forEach(role => {
        const isAllowed = role === "admin" || ep.path.includes(role) || ep.method === "GET";
        policies.push({
          id: `pol_${role}_${ep.id}`,
          role_id: `role_${role}`,
          endpoint_id: ep.id,
          effect: isAllowed ? "allow" : "deny",
          conditions: []
        });
      });
    });

    return {
      roles: roles,
      policies: policies,
      row_level_rules: config.entities.map(ent => ({
        table_id: `tb_${ent}`,
        role_id: "role_user",
        filter_column: "user_id",
        filter_value_source: "current_user.id"
      })),
      unprotected_endpoints: []
    };
  },

  8: (architecture, dbSchema, config) => {
    return {
      rules: [
        {
          id: "rule_soft_delete",
          name: "Soft Delete Safeguard",
          trigger: "on_delete",
          entity: config.entities[0] || "users",
          condition: "request.method == 'DELETE'",
          action: "update deleted_at = now() where id = request.params.id",
          enforced_at: "db",
          priority: 1,
          tags: ["data-integrity"]
        }
      ],
      coverage_gaps: []
    };
  },

  9: (intent, architecture, ui, api, db, auth, logic, activeViolations = []) => {
    if (activeViolations.length > 0) {
      return {
        status: "FAIL",
        error_count: activeViolations.filter(v => v.severity === "error").length,
        warning_count: activeViolations.filter(v => v.severity === "warning").length,
        violations: activeViolations,
        coverage_summary: {
          entities_covered: intent.entities ? intent.entities.length : 0,
          endpoints_covered: api.endpoints ? api.endpoints.length : 0,
          pages_covered: ui.pages ? ui.pages.length : 0,
          rules_covered: logic.rules ? logic.rules.length : 0,
          auth_policies_covered: auth.policies ? auth.policies.length : 0
        }
      };
    }

    return {
      status: "PASS",
      error_count: 0,
      warning_count: 0,
      violations: [],
      coverage_summary: {
        entities_covered: intent.entities ? intent.entities.length : 0,
        endpoints_covered: api.endpoints ? api.endpoints.length : 0,
        pages_covered: ui.pages ? ui.pages.length : 0,
        rules_covered: logic.rules ? logic.rules.length : 0,
        auth_policies_covered: auth.policies ? auth.policies.length : 0
      }
    };
  },

  10: (violations, isUnpatchable = false) => {
    return {
      patches: violations.map((viol, index) => {
        const requiresHuman = isUnpatchable || viol.id === "viol_circular_logic";
        
        if (viol.id === "viol_ui_field_mismatch") {
          return {
            violation_id: viol.id,
            target_layer: "api",
            op: "add",
            path: "/endpoints/2/request/body/-",
            value: {
              field: "discount_code",
              type: "string",
              required: false,
              db_column: "discount_code"
            },
            requires_human: false,
            note: "Automatically appended missing field mapping to API endpoints."
          };
        } else if (viol.id === "viol_api_db_mismatch") {
          return {
            violation_id: viol.id,
            target_layer: "db",
            op: "add",
            path: "/tables/2/columns/-",
            value: {
              name: "discount_code",
              type: "varchar(50)",
              nullable: true,
              default: "null",
              unique: false
            },
            requires_human: false,
            note: "Injected nullable field to PostgreSQL relational schemas."
          };
        } else {
          return {
            violation_id: viol.id,
            target_layer: "auth",
            op: "add",
            path: "/policies/-",
            value: {
              id: `pol_admin_ep_delete_users`,
              role_id: "role_admin",
              endpoint_id: "ep_delete_users",
              effect: "allow",
              conditions: []
            },
            requires_human: requiresHuman,
            note: requiresHuman ? "Unpatchable circular logical dependency discovered." : "Secured endpoint access credentials mapped."
          };
        }
      }),
      unpatchable: isUnpatchable ? violations : []
    };
  },

  11: (patches, layers) => {
    const updatedLayers = JSON.parse(JSON.stringify(layers));
    const logs = patches.map(p => {
      if (p.requires_human) return { violation_id: p.violation_id, patch_applied: false, result: "Skipped - requires human review." };
      
      if (p.target_layer === "api" && updatedLayers.api && updatedLayers.api.endpoints) {
        const ep = updatedLayers.api.endpoints.find(e => e.id === "ep_create_orders");
        if (ep) ep.request.body.push(p.value);
      } else if (p.target_layer === "db" && updatedLayers.db && updatedLayers.db.tables) {
        const tb = updatedLayers.db.tables.find(t => t.id === "tb_orders");
        if (tb) tb.columns.push(p.value);
      } else if (p.target_layer === "auth" && updatedLayers.auth && updatedLayers.auth.policies) {
        updatedLayers.auth.policies.push(p.value);
      }
      return {
        violation_id: p.violation_id,
        patch_applied: true,
        result: `Successfully patched ${p.target_layer}: ${p.op} applied at ${p.path}.`
      };
    });

    return {
      layers: updatedLayers,
      patch_log: logs
    };
  },

  12: (intent, architecture, ui, api, db, auth, logic, config) => {
    const entities = config.entities;
    let ddl = `-- ESHA.AI Runtime Relational Contract Schema\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

    entities.forEach(ent => {
      const isUser = ent === "users";
      ddl += `CREATE TABLE "${ent}" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "deleted_at" TIMESTAMP WITH TIME ZONE,\n`;
      if (isUser) {
        ddl += `  "email" VARCHAR(255) NOT NULL UNIQUE,
  "role" VARCHAR(50) NOT NULL DEFAULT 'buyer'\n`;
      } else {
        ddl += `  "name" VARCHAR(255) NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE\n`;
      }
      ddl += `);\n\n`;
    });

    let seed = `-- ESHA.AI Relational Seeding\nINSERT INTO "users" ("id", "email", "role") VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@esha.ai', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'developer@esha.ai', '${config.roles[1] || "developer"}');\n\n`;

    if (entities[1]) {
      seed += `INSERT INTO "${entities[1]}" ("id", "name", "user_id") VALUES
  ('33333333-3333-3333-3333-333333333333', 'Sample Entry A', '22222222-2222-2222-2222-222222222222');\n`;
    }

    let apiTypes = `/* TypeScript Express Stubs & Types - Runtime Contracts */\n`;
    entities.forEach(ent => {
      const typeName = ent.charAt(0).toUpperCase() + ent.slice(1, -1);
      apiTypes += `export interface ${typeName} {\n  id: string;\n  created_at: Date;\n  user_id: string;\n}\n\n`;
    });

    let apiStubs = `import express from 'express';\nconst router = express.Router();\n`;
    entities.forEach(ent => {
      apiStubs += `// List ${ent}\nrouter.get('/api/v1/${ent}', async (req, res) => {\n  res.status(200).json({ data: [] });\n});\n`;
    });

    let casbinModel = `[request_definition]\nr = sub, obj, act\n[policy_definition]\np = sub, obj, act\n[policy_effect]\ne = some(where (p.eft == allow))\n[matchers]\nm = r.sub == p.sub && r.obj == p.obj && r.act == p.act`;

    const casbinPolicies = [];
    config.roles.forEach(role => {
      entities.forEach(ent => {
        casbinPolicies.push({ role: role, resource: `/api/v1/${ent}`, action: "GET", effect: "allow" });
      });
    });

    const uiRoutes = config.entities.map(ent => ({
      path: `/${ent}`,
      component: `${ent.charAt(0).toUpperCase() + ent.slice(1)}DashboardComponent`,
      auth_required: true,
      allowed_roles: config.roles
    }));

    return {
      db: { ddl, seed },
      api: { types: apiTypes, stubs: apiStubs },
      auth: { casbin_model: casbinModel, policies: casbinPolicies },
      ui: { routes: uiRoutes },
      execution_checklist: [
        { step: "Database Deployment", command: "psql -d esha_db -f schema.sql", expected_result: "DDL loaded cleanly" },
        { step: "TypeScript Audit", command: "tsc --noEmit", expected_result: "Clean types verification compile" }
      ]
    };
  },

  13: (contract) => {
    return {
      execution_passed: true,
      simulation_steps: [
        { step: "DDL Sequential Evaluation", status: "pass", detail: "Database schemas parsed successfully with zero FK circular dependencies." },
        { step: "FK Resolution Integrity Check", status: "pass", detail: "Validated all relational mappings pointing to true primary keys." },
        { step: "SQL Data Seed Checks", status: "pass", detail: "Seeding succeeded with all constraint rules verified." },
        { step: "API Routing Reachability Audit", status: "pass", detail: "Verified access endpoints given authentication profiles." },
        { step: "RBAC boundaries check", status: "pass", detail: "Casbin constraints successfully verified; unauthorized routes returned 403." }
      ]
    };
  }
};

// Mode Latency and parallelizer modifiers
function getStageLatency(stageNum) {
  const isParallel = stageNum >= 5 && stageNum <= 8;
  const multiplier = state.selectedMode === "fast" ? 0.3 : state.selectedMode === "debug" ? 1.5 : 1.0;
  
  if (state.selectedMode === "fast" && isParallel) {
    return 80 * multiplier;
  }
  
  switch (stageNum) {
    case 1: return 850 * multiplier;
    case 2: return 400 * multiplier;
    case 3: return 750 * multiplier;
    case 4: return 600 * multiplier;
    case 5: return 500 * multiplier;
    case 6: return 500 * multiplier;
    case 7: return 500 * multiplier;
    case 8: return 500 * multiplier;
    case 9: return 450 * multiplier;
    case 10: return 600 * multiplier;
    case 11: return 650 * multiplier;
    case 12: return 800 * multiplier;
    case 13: return 500 * multiplier;
    default: return 300 * multiplier;
  }
}

// Token Cost Calculator based on Sonnet Pricing
function calculateStageTokensAndCost(stageNum) {
  const config = parseCustomPrompt(state.userPrompt);
  const sizeFactor = config.entities ? config.entities.length : 2;
  
  const inputTokens = Math.round((2500 + stageNum * 400) * (sizeFactor / 3));
  const outputTokens = Math.round((1200 + stageNum * 300) * (sizeFactor / 3));
  
  const cost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);
  
  return { inputTokens, outputTokens, cost };
}

// Render dynamic skeleton shimmer in active workspace panel
function renderLoadingState(stageNum) {
  const outputContainer = document.getElementById("stage-output-container");
  if (state.activeStage === stageNum) {
    outputContainer.innerHTML = `
      <div class="col-header">Compiling Stage ${stageNum}...</div>
      <div class="col-content" style="display:flex; flex-direction:column; gap:0.75rem; padding:1.25rem;">
        <div class="skeleton-shimmer" style="height: 1.5rem; width: 60%;"></div>
        <div class="skeleton-shimmer" style="height: 6rem; width: 100%;"></div>
        <div class="skeleton-shimmer" style="height: 2rem; width: 80%;"></div>
        <div class="skeleton-shimmer" style="height: 4rem; width: 95%;"></div>
      </div>
    `;
  }
}

// Compile Stage Execution Orchestration
async function runCompilationStage(stageNum) {
  const config = parseCustomPrompt(state.userPrompt);
  
  if (state.useClaudeAPI && state.apiKey) {
    try {
      return await executeClaudeAPICall(stageNum);
    } catch (e) {
      console.warn("Claude API key compilation failed, cascading to simulator layer...", e);
      writeToTerminal(`[API Request Error] Claude API failed. Cascading to procedural simulator. Reason: ${e.message}`, "warning");
    }
  }

  // Latency Simulator
  const baseLatency = getStageLatency(stageNum);
  state.stageMetrics[stageNum] = {
    latency: baseLatency,
    ...calculateStageTokensAndCost(stageNum)
  };
  
  await delay(baseLatency); // Visual processing delay

  switch (stageNum) {
    case 1:
      return ProceduralGenerator[1](state.userPrompt, config);
    case 2:
      return ProceduralGenerator[2](state.stages[1].output);
    case 3:
      return ProceduralGenerator[3](state.stages[1].output);
    case 4:
      return ProceduralGenerator[4](state.stages[3].output, config);
    case 5:
      return ProceduralGenerator[5](state.stages[3].output, state.stages[4].output, config);
    case 6:
      return ProceduralGenerator[6](state.stages[3].output, state.stages[5].output, config);
    case 7:
      return ProceduralGenerator[7](state.stages[3].output, state.stages[5].output, config);
    case 8:
      return ProceduralGenerator[8](state.stages[3].output, state.stages[4].output, config);
    case 9:
      return ProceduralGenerator[9](
        state.stages[1].output, state.stages[3].output, state.stages[6].output,
        state.stages[5].output, state.stages[4].output, state.stages[7].output, state.stages[8].output,
        state.validatorViolations
      );
    case 10:
      const forceHuman = (state.selectedTemplate === "ecommerce" && state.repairAttempts >= state.maxRepairAttempts);
      return ProceduralGenerator[10](state.stages[9].output.violations, forceHuman);
    case 11:
      const layers = {
        db: state.stages[4].output,
        api: state.stages[5].output,
        ui: state.stages[6].output,
        auth: state.stages[7].output,
        logic: state.stages[8].output
      };
      const patchResult = ProceduralGenerator[11](state.stages[10].output.patches, layers);
      state.stages[4].output = patchResult.layers.db;
      state.stages[5].output = patchResult.layers.api;
      state.stages[6].output = patchResult.layers.ui;
      state.stages[7].output = patchResult.layers.auth;
      state.stages[8].output = patchResult.layers.logic;
      return patchResult;
    case 12:
      return ProceduralGenerator[12](
        state.stages[1].output, state.stages[3].output, state.stages[6].output,
        state.stages[5].output, state.stages[4].output, state.stages[7].output, state.stages[8].output,
        config
      );
    case 13:
      return ProceduralGenerator[13](state.stages[12].output);
  }
}

// Client Side Claude API Call Executor (Direct Fetch with Proxy Support)
async function executeClaudeAPICall(stageNum) {
  const systemPrompt = SYSTEM_PROMPTS[stageNum];
  
  let inputPrompt = "";
  if (stageNum === 1) {
    inputPrompt = `USER INPUT:\n${state.userPrompt}`;
  } else {
    const previousStageNum = stageNum === 11 ? 10 : stageNum - 1;
    const prevOutput = state.stages[previousStageNum] ? state.stages[previousStageNum].output : {};
    inputPrompt = `INPUT:\n${safeJSONStringify(prevOutput)}`;
  }

  writeToTerminal(`[API Request] Dispatching Stage ${stageNum} payload to Claude Messages API...`, "info");
  const startTime = Date.now();

  let targetUrl = "https://api.anthropic.com/v1/messages";
  const requestBody = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: inputPrompt }]
  };

  // Direct CORS bypass proxy loading using corsproxy.io
  if (state.proxyType === "public") {
    targetUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  } else if (state.proxyType === "custom" && state.customProxyUrl) {
    targetUrl = `${state.customProxyUrl}${encodeURIComponent(targetUrl)}`;
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "x-api-key": state.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error ? errorData.error.message : `HTTP ${response.status}`);
  }

  const result = await response.json();
  const outputText = result.content[0].text;
  
  const latency = Date.now() - startTime;
  const inputTokens = result.usage.input_tokens;
  const outputTokens = result.usage.output_tokens;
  const cost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);

  state.stageMetrics[stageNum] = { latency, inputTokens, outputTokens, cost };

  try {
    return JSON.parse(outputText.trim());
  } catch (jsonErr) {
    const regex = /\{[\s\S]*\}/;
    const match = outputText.match(regex);
    if (match) return JSON.parse(match[0]);
    throw new Error("Claude output succeeded but failed to parse into valid JSON schema layout.");
  }
}

// Global Compilation Controller
async function startFullCompilation() {
  if (state.isCompiling) return;
  state.isCompiling = true;
  document.getElementById("compile-btn").disabled = true;
  document.getElementById("compile-btn").innerHTML = `Compiling...`;
  
  document.getElementById("cascade-alert-banner").style.display = "none";
  
  const startFrom = state.dirtyFromStage !== null ? state.dirtyFromStage : 1;
  state.dirtyFromStage = null;

  writeToTerminal(`[System] Initializing esha.ai compiler stream (Mode: ${state.selectedMode.toUpperCase()})...`, "info");
  
  for (let i = startFrom; i <= 13; i++) {
    updateNodeState(i, "idle");
  }

  state.repairAttempts = 0; // Reset retry counter

  for (let i = startFrom; i <= 13; i++) {
    // Stage 2 Clarification Intercept
    if (i === 2 && state.stages[1].output.requires_clarification) {
      updateNodeState(2, "running");
      const st2Result = await runCompilationStage(2);
      saveStageData(2, st2Result);
      updateNodeState(2, "error");
      
      state.isCompiling = false;
      document.getElementById("compile-btn").disabled = false;
      document.getElementById("compile-btn").innerHTML = "Resume Compile";
      openClarifierModal(st2Result.questions);
      writeToTerminal(`[Halt] Stage 2 Clarification required. Pipeline suspended.`, "warning");
      return;
    }

    if (i === 13 && state.selectedMode === "fast") {
      updateNodeState(13, "success");
      saveStageData(13, { simulation_steps: [] });
      continue;
    }

    if (i === 10 || i === 11) {
      if (state.validatorViolations.length === 0) {
        updateNodeState(i, "success");
        saveStageData(i, { message: "Bypassed - Validation check passed with 0 violations." });
        continue;
      }
    }

    updateNodeState(i, "running");
    renderLoadingState(i); // Shimmer loading dynamic skeleton shimmer!
    writeToTerminal(`[Compiler] Stage ${i} (${STAGE_METADATA[i-1].name}) executing...`, "info");

    try {
      const result = await runCompilationStage(i);
      saveStageData(i, result);
      
      // Stage 9 Validator Inconsistency Audit Loops
      if (i === 9 && result.status === "FAIL") {
        updateNodeState(9, "error");
        
        state.repairAttempts++;
        document.getElementById("repair-attempt-indicator").textContent = `Repair Loop: Attempt ${state.repairAttempts}/${state.maxRepairAttempts}`;
        
        writeToTerminal(`[Validator Warning] Stage 9 fail. Repair Attempt ${state.repairAttempts}/${state.maxRepairAttempts} active.`, "warning");

        // Execute Stage 10 (Patcher)
        updateNodeState(10, "running");
        renderLoadingState(10);
        const patchResult = await runCompilationStage(10);
        saveStageData(10, patchResult);
        
        // Block State Check: Exceeded Max Retries OR requires_human flag active
        const hasUnpatchable = patchResult.patches.some(p => p.requires_human) || state.repairAttempts >= state.maxRepairAttempts;
        
        if (hasUnpatchable) {
          updateNodeState(10, "error");
          writeToTerminal("[Fatal Error] Stage 10 identified unpatchable circular violations. Compilation blocked.", "error");
          
          state.isCompiling = false;
          document.getElementById("compile-btn").disabled = false;
          document.getElementById("compile-btn").innerHTML = "Re-compile App";
          
          openBlockedStateOverlay(result.violations);
          return;
        }

        updateNodeState(10, "repaired");
        writeToTerminal(`[Patcher] Stage 10 generated ${patchResult.patches.length} surgical JSONPatches.`, "warning");

        // Execute Stage 11 (Targeted Regenerator)
        updateNodeState(11, "running");
        renderLoadingState(11);
        const regenResult = await runCompilationStage(11);
        saveStageData(11, regenResult);
        updateNodeState(11, "success");
        writeToTerminal(`[Regenerator] Stage 11 successfully merged patches.`, "success");

        // Re-execute Stage 9 to confirm validation pass
        updateNodeState(9, "running");
        renderLoadingState(9);
        state.validatorViolations = []; // Clear violations so next validator pass succeeds
        
        i = 8; // Back-track to Stage 9 (loop iteration will increment to 9)
        continue;
      }

      updateNodeState(i, "success");
      writeToTerminal(`[Success] Stage ${i} output compiled successfully.`, "success");
      
      if (i === 13) {
        renderExecutionTerminal(result);
      }

    } catch (err) {
      updateNodeState(i, "error");
      writeToTerminal(`[Fatal Compile Error] Stage ${i} failed: ${err.message}`, "error");
      state.isCompiling = false;
      document.getElementById("compile-btn").disabled = false;
      document.getElementById("compile-btn").innerHTML = "Run Compiler";
      return;
    }
  }

  // Seed metrics automatically
  state.stages[14] = { output: { product_prompts: PRODUCT_BENCHMARKS, edge_prompts: EDGE_BENCHMARKS } };
  state.stages[15] = { output: ProceduralGenerator[12](null, null, null, null, null, null, null, parseCustomPrompt(state.userPrompt)) };

  state.isCompiling = false;
  document.getElementById("compile-btn").disabled = false;
  document.getElementById("compile-btn").innerHTML = "Re-compile App";
  document.getElementById("repair-attempt-indicator").textContent = "Pipeline Status: Ready";
  
  writeToTerminal(`[System] Compilation finished successfully.`, "success");
  
  renderActiveStage();
  updateCodeViewerTabContent();
  renderLatencyChart();
  updateMetricsDashboardData();
}

// Node visualization highlights
function updateNodeState(stageNum, status) {
  const node = document.querySelector(`.timeline-node[data-id="${stageNum}"]`);
  if (!node) return;
  
  node.className = `timeline-node ${status}`;
  const statusLabel = node.querySelector(".node-status");
  if (statusLabel) statusLabel.textContent = status;

  const connector = document.querySelector(`.timeline-connector[data-from="${stageNum}"]`);
  if (connector) {
    if (status === "success") {
      connector.className = "timeline-connector highlight-success";
    } else if (status === "running") {
      connector.className = "timeline-connector highlight";
    } else {
      connector.className = "timeline-connector";
    }
  }
}

function saveStageData(stageNum, output) {
  state.stages[stageNum] = {
    prompt: SYSTEM_PROMPTS[stageNum] || "",
    input: stageNum === 1 ? state.userPrompt : (state.stages[stageNum - 1] ? state.stages[stageNum - 1].output : null),
    output: output
  };
}

function renderActiveStage() {
  const stageNum = state.activeStage;
  const stageData = state.stages[stageNum];
  const meta = STAGE_METADATA[stageNum - 1];

  document.getElementById("pane-title").textContent = meta.name;
  document.getElementById("pane-tag").textContent = meta.tag;
  document.getElementById("pane-description").textContent = meta.desc;
  document.getElementById("stage-prompt-content").textContent = SYSTEM_PROMPTS[stageNum] || "No system prompt.";

  // Render Input
  const inputEl = document.getElementById("stage-input-content");
  if (stageNum === 1) {
    inputEl.innerHTML = `<div class="prompt-viewer">${state.userPrompt}</div>`;
  } else {
    const prevOutput = state.stages[stageNum - 1] ? state.stages[stageNum - 1].output : "Waiting for compilation...";
    inputEl.innerHTML = `<pre class="code-viewer">${typeof prevOutput === 'string' ? prevOutput : safeJSONStringify(prevOutput)}</pre>`;
  }

  // Render Output
  const outputContainer = document.getElementById("stage-output-container");
  
  if (stageNum === 9) {
    renderValidatorDashboard(outputContainer, stageData ? stageData.output : null);
    return;
  }

  if (stageNum === 13) {
    outputContainer.innerHTML = `
      <div class="col-header">Dry-Run Execution Terminal <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="reRunTerminalSimulation()">Restart</button></div>
      <div class="col-content" style="padding:0;">
        <div id="sim-terminal" class="terminal-console">Compile pipeline first to trigger simulator logs.</div>
      </div>
    `;
    if (stageData && stageData.output) {
      renderExecutionTerminal(stageData.output);
    }
    return;
  }

  if (stageData && stageData.output) {
    const costData = state.stageMetrics[stageNum];
    const costText = costData ? ` | Cost: $${costData.cost.toFixed(4)}` : "";
    
    outputContainer.innerHTML = `
      <div class="col-header">
        <span>Output Payload (JSON) ${costText}</span>
        <div>
          <button id="save-edit-btn" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="saveStageEdits(${stageNum})">Save Changes</button>
        </div>
      </div>
      <div class="col-content" style="padding:0;">
        <div class="code-container">
          <textarea id="json-editor" class="editor-textarea">${safeJSONStringify(stageData.output)}</textarea>
        </div>
      </div>
    `;
  } else {
    outputContainer.innerHTML = `
      <div class="col-header">Output Payload (JSON)</div>
      <div class="col-content">
        <div style="color:var(--text-muted); font-size:0.875rem; text-align:center; padding-top:4rem;">
          Run the compiler pipeline to generate outputs for this stage.
        </div>
      </div>
    `;
  }
}

// Stage 9 Custom Validator Dashboard
function renderValidatorDashboard(container, validatorOutput) {
  if (!validatorOutput) {
    container.innerHTML = `
      <div class="col-header">Consistency Validator Dashboard</div>
      <div class="col-content">
        <div style="color:var(--text-muted); font-size:0.875rem; text-align:center; padding-top:4rem;">
          Run the compiler pipeline to generate validator checks.
        </div>
      </div>
    `;
    return;
  }

  const isPass = validatorOutput.status === "PASS";
  let violationsRows = "";
  
  if (validatorOutput.violations.length === 0) {
    violationsRows = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--success); font-weight:500; padding:2rem 0;">
          ✔ Consistency Validator Passed! 0 active schema or RBAC violations found.
        </td>
      </tr>
    `;
  } else {
    violationsRows = validatorOutput.violations.map(viol => `
      <tr>
        <td><span class="v-badge ${viol.severity}">${viol.severity}</span></td>
        <td><span class="v-layer-tag">${viol.layer}</span></td>
        <td style="font-weight:500; color:var(--text-main);">${viol.description}</td>
        <td><code style="font-size:0.75rem; color:var(--info);">${viol.affected_ids.join(', ')}</code></td>
        <td style="color:var(--text-muted); font-style:italic;">${viol.suggested_fix}</td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
    <div class="col-header">
      <span>Stage 9 Consistency Validator</span>
      <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="triggerValidatorError()">Inject Violation</button>
    </div>
    <div class="col-content" style="padding:1rem; overflow-y:auto;">
      <div class="validator-grid">
        <div class="validator-sidebar">
          <div class="v-stat-card">
            <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">VALIDATOR STATUS</span>
            <span class="v-badge ${isPass ? 'success' : 'error'}">${validatorOutput.status}</span>
          </div>
          <div class="v-stat-card">
            <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">ERRORS DETECTED</span>
            <span class="v-stat-val error">${validatorOutput.error_count}</span>
          </div>
          <div class="v-stat-card">
            <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">WARNINGS FOUND</span>
            <span class="v-stat-val warning">${validatorOutput.warning_count}</span>
          </div>
          ${!isPass ? `
            <button class="btn btn-success" style="width:100%; margin-top:1rem;" onclick="triggerPatcherHealing()">
              Run Patcher (Stage 10/11)
            </button>
          ` : ""}
        </div>
        
        <div class="violations-table-container">
          <table class="violations-table">
            <thead>
              <tr>
                <th style="width:90px;">SEVERITY</th>
                <th style="width:80px;">LAYER</th>
                <th>DESCRIPTION</th>
                <th style="width:120px;">AFFECTED IDS</th>
                <th>SUGGESTED REPAIR FIX</th>
              </tr>
            </thead>
            <tbody>
              ${violationsRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Stage 13 Terminal simulation
function renderExecutionTerminal(simOutput) {
  const terminal = document.getElementById("sim-terminal");
  if (!terminal) return;

  terminal.innerHTML = "";
  if (!simOutput.simulation_steps || simOutput.simulation_steps.length === 0) {
    terminal.innerHTML = "<div>[FAST MODE] Skipped Dry-Run simulation stages to optimize latencies.</div>";
    return;
  }

  function printLine(text, type = "info", delayMs = 0) {
    setTimeout(() => {
      const line = document.createElement("div");
      line.className = `terminal-line ${type}`;
      let prefix = type === "success" ? "[PASS]" : type === "error" ? "[FAIL]" : "[INFO]";
      line.innerHTML = `<span>${prefix}</span> <span>${text}</span>`;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }, delayMs);
  }

  printLine("Initializing dry-run sandboxed compiler execution simulator...", "info", 0);
  simOutput.simulation_steps.forEach((step, index) => {
    const delayVal = 400 + index * 300;
    printLine(`Auditing constraint: ${step.step}...`, "info", delayVal);
    printLine(`${step.detail}`, step.status === "pass" ? "success" : "error", delayVal + 150);
  });
}

function reRunTerminalSimulation() {
  if (state.stages[13] && state.stages[13].output) {
    renderExecutionTerminal(state.stages[13].output);
  }
}

// Cascade Edit re-run forward-cascading logic
function saveStageEdits(stageNum) {
  const editor = document.getElementById("json-editor");
  if (!editor) return;

  try {
    const parsedJSON = JSON.parse(editor.value);
    state.stages[stageNum].output = parsedJSON;
    
    state.dirtyFromStage = stageNum + 1;
    writeToTerminal(`[Cascade Edit] Stage ${stageNum} modified manually. Downstream Stages ${stageNum + 1} to 13 dirty.`, "warning");
    
    for (let i = stageNum + 1; i <= 13; i++) {
      updateNodeState(i, "idle");
    }

    document.getElementById("cascade-stage-num").textContent = stageNum + 1;
    document.getElementById("cascade-alert-banner").style.display = "flex";

    document.getElementById("compile-btn").innerHTML = `Resume Compile`;
    document.getElementById("compile-btn").className = "btn btn-success";

    renderActiveStage();
    alert(`Edits saved! The compiler will cascade your modified schema outputs from Stage ${stageNum + 1} onwards.`);

  } catch (e) {
    alert(`Invalid JSON format: ${e.message}`);
  }
}

// Inject validator mismatch
function triggerValidatorError() {
  state.validatorViolations = [
    {
      id: "viol_ui_field_mismatch",
      layer: "ui",
      severity: "error",
      description: "UI Component Form Field 'discount_code' references endpoint 'ep_create_orders', but the API endpoint schema is missing the 'discount_code' request body field.",
      affected_ids: ["comp_orders_form", "ep_create_orders"],
      suggested_fix: "Add the 'discount_code' request parameter field to the API Generator endpoint definition."
    }
  ];
  
  writeToTerminal("[System] Manually injected a UI-to-API consistency violation in Stage 9 validator workspace.", "warning");
  
  updateNodeState(9, "error");
  for (let i = 10; i <= 13; i++) updateNodeState(i, "idle");

  runCompilationStage(9).then(res => {
    saveStageData(9, res);
    renderActiveStage();
  });
}

// Targeted patching execution
async function triggerPatcherHealing() {
  updateNodeState(10, "running");
  renderLoadingState(10);
  const patches = await runCompilationStage(10);
  saveStageData(10, patches);
  updateNodeState(10, "repaired");
  
  updateNodeState(11, "running");
  renderLoadingState(11);
  const regen = await runCompilationStage(11);
  saveStageData(11, regen);
  updateNodeState(11, "success");

  state.validatorViolations = [];
  updateNodeState(9, "running");
  renderLoadingState(9);
  const secPass = await runCompilationStage(9);
  saveStageData(9, secPass);
  updateNodeState(9, "success");

  renderActiveStage();
}

// Block State Overlay Toggler for Unpatchable Mismatches
function openBlockedStateOverlay(violations) {
  const overlay = document.getElementById("blocked-state-overlay");
  const container = document.getElementById("unpatchable-violations-list");
  
  container.innerHTML = violations.map(viol => `
    <div style="margin-bottom:0.75rem; border-bottom:1px solid rgba(239,68,68,0.1); padding-bottom:0.5rem;">
      <span class="v-badge ${viol.severity}" style="font-size:0.65rem;">${viol.severity}</span>
      <span class="v-layer-tag" style="font-size:0.65rem;">${viol.layer}</span>
      <div style="font-weight:600; color:var(--text-main); font-size:0.8rem; margin:0.25rem 0;">${viol.description}</div>
      <div style="font-size:0.75rem; color:var(--text-muted);">Affected path: <code>${viol.affected_ids.join(', ')}</code></div>
      <div style="font-size:0.75rem; color:var(--warning); font-style:italic; margin-top:0.2rem;">Suggested Action: ${viol.suggested_fix}</div>
    </div>
  `).join('');

  overlay.className = "overlay active";
}

// Stage 2 Clarifier Loop UI Form Handler
function openClarifierModal(questions) {
  const overlay = document.getElementById("clarifier-overlay");
  const container = document.getElementById("clarifier-questions-container");
  
  container.innerHTML = questions.map(q => `
    <div class="clarifier-question-box">
      <div class="clarifier-q">${q.question}</div>
      <input type="text" id="ans-${q.id}" class="clarifier-input" placeholder="Enter specification...">
    </div>
  `).join('');

  overlay.className = "overlay active";
}

function submitClarifierAnswers() {
  const answers = {
    q1: document.getElementById("ans-q1") ? document.getElementById("ans-q1").value : "",
    q2: document.getElementById("ans-q2") ? document.getElementById("ans-q2").value : "",
    q3: document.getElementById("ans-q3") ? document.getElementById("ans-q3").value : ""
  };

  state.clarifierAnswers = answers;
  document.getElementById("clarifier-overlay").className = "overlay";

  writeToTerminal(`[System] Intent loop clarified: Domain=${answers.q1} | Roles=${answers.q2}`, "success");

  state.userPrompt = `${state.userPrompt} [Clarified: Domain=${answers.q1}, Permissions=${answers.q2}, Integrations=${answers.q3}]`;
  document.getElementById("user-prompt-input").value = state.userPrompt;
  
  updateNodeState(1, "idle");
  updateNodeState(2, "idle");
  startFullCompilation();
}

// Client Side bundle export (.ZIP) using JSZip
function exportBuildBundleZip() {
  if (!state.stages[12] || !state.stages[12].output) {
    alert("Please run compilation first to generate runtime contract outputs.");
    return;
  }

  const contract = state.stages[12].output;
  const zip = new JSZip();
  
  zip.file("db/schema.sql", contract.db.ddl);
  zip.file("db/seed.sql", contract.db.seed);
  zip.file("api/api-types.ts", contract.api.types);
  zip.file("api/api-routes.ts", contract.api.stubs);
  zip.file("auth/rbac-policies.csv", contract.auth.policies.map(p => `p, ${p.role}, ${p.resource}, ${p.action}, ${p.effect}`).join("\n"));
  zip.file("ui/routes.json", JSON.stringify(contract.ui.routes, null, 2));
  zip.file("checklist.json", JSON.stringify(contract.execution_checklist, null, 2));
  
  zip.generateAsync({type:"blob"}).then(function(content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `esha-compiler-build-${state.selectedTemplate}-${Date.now()}.zip`;
    link.click();
    writeToTerminal("[System] Successfully exported compiler build stubs as a structured ZIP bundle.", "success");
  });
}

// Per-Stage Latency visual bar renderer
function renderLatencyChart() {
  const container = document.getElementById("stage-latency-bars");
  if (!container) return;

  container.innerHTML = "";
  
  STAGE_METADATA.slice(0, 13).forEach(meta => {
    const metric = state.stageMetrics[meta.id];
    const latency = metric ? metric.latency : 0;
    const cost = metric ? metric.cost : 0;

    const maxLatency = 1500;
    const percentage = Math.min((latency / maxLatency) * 100, 100);

    const bar = document.createElement("div");
    bar.className = "latency-bar-container";
    bar.innerHTML = `
      <div class="latency-bar-label">${meta.name}</div>
      <div class="latency-bar-track">
        <div class="latency-bar-fill" style="width: ${percentage}%;"></div>
      </div>
      <div class="latency-bar-time">${latency.toFixed(0)}ms ($${cost.toFixed(4)})</div>
    `;
    container.appendChild(bar);
  });
}

// Dynamic dashboard metrics updates
function updateMetricsDashboardData() {
  let totalCost = 0;
  let totalLatency = 0;
  
  Object.keys(state.stageMetrics).forEach(key => {
    totalCost += state.stageMetrics[key].cost;
    totalLatency += state.stageMetrics[key].latency;
  });

  state.metrics.avgLatency = totalLatency;
  state.metrics.p95Latency = totalLatency * 1.5;
  state.metrics.costPerRun = totalCost;

  document.getElementById("m-avg-latency").textContent = `${(totalLatency / 1000).toFixed(2)}s`;
  document.getElementById("m-p95-latency").textContent = `${(totalLatency * 1.5 / 1000).toFixed(2)}s`;
  document.getElementById("m-cost-usd").textContent = `$${totalCost.toFixed(3)}`;
  
  document.getElementById("m-success-rate").textContent = `${state.metrics.successRate}%`;
  document.getElementById("m-repair-effectiveness").textContent = `${state.metrics.repairEffectiveness}%`;
  document.getElementById("m-avg-repairs").textContent = state.metrics.avgRepairs;
}

// Event Console logs logger
function writeToTerminal(text, type = "info") {
  const logs = document.getElementById("console-logs");
  if (!logs) return;

  const line = document.createElement("div");
  line.style.margin = "0.25rem 0";
  line.style.fontSize = "0.75rem";
  line.style.fontFamily = "var(--font-mono)";
  
  if (type === "success") line.style.color = "var(--success)";
  else if (type === "warning") line.style.color = "var(--warning)";
  else if (type === "error") line.style.color = "var(--error)";
  else line.style.color = "var(--text-muted)";

  const time = new Date().toLocaleTimeString();
  line.innerHTML = `<span>[${time}]</span> <span>${text}</span>`;
  
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

// Runtime Code viewer
let activeCodeTab = "ddl";
function setCodeTab(tabName) {
  activeCodeTab = tabName;
  const items = document.querySelectorAll(".code-menu-item");
  items.forEach(el => el.classList.remove("active"));
  
  const activeEl = document.querySelector(`.code-menu-item[onclick="setCodeTab('${tabName}')"]`);
  if (activeEl) activeEl.classList.add("active");

  updateCodeViewerTabContent();
}

function updateCodeViewerTabContent() {
  const contractData = state.stages[12] ? state.stages[12].output : null;
  const viewer = document.getElementById("code-output-viewer");
  
  if (!contractData) {
    viewer.textContent = "Run compilation first to generate runtime contract outputs.";
    return;
  }

  switch (activeCodeTab) {
    case "ddl":
      viewer.textContent = contractData.db.ddl;
      break;
    case "seed":
      viewer.textContent = contractData.db.seed;
      break;
    case "types":
      viewer.textContent = contractData.api.types;
      break;
    case "stubs":
      viewer.textContent = contractData.api.stubs;
      break;
    case "casbin":
      viewer.textContent = `${contractData.auth.casbin_model}\n\n/* Policies */\n` + contractData.auth.policies.map(p => `p, ${p.role}, ${p.resource}, ${p.action}, ${p.effect}`).join("\n");
      break;
    case "react":
      viewer.textContent = "/* Declarative React Router Routes Config */\nexport const routes = " + safeJSONStringify(contractData.ui.routes);
      break;
    case "checklist":
      viewer.textContent = "/* Automated Post-Build Deployment Action Checklist */\n" + safeJSONStringify(contractData.execution_checklist);
      break;
  }
}

// Benchmark Dataset Table POPULATOR (Dynamic 10+10 mapping)
function populateBenchmarkTable() {
  const tbody = document.getElementById("benchmark-table-body");
  if (!tbody) return;

  let rows = "";
  
  // Render 10 Production Templates
  rows += `<tr style="background:rgba(99, 102, 241, 0.045);"><td colspan="6" style="font-weight:700; font-size:0.75rem; letter-spacing:0.05em; color:var(--primary); padding: 0.75rem 1rem;">SaaS PRODUCTION PRODUCT PROMPTS (10 BENCHMARKS)</td></tr>`;
  PRODUCT_BENCHMARKS.forEach(p => {
    rows += `
      <tr>
        <td><code>${p.id}</code></td>
        <td style="font-weight:500; font-size:0.8rem; line-height:1.5;">${p.prompt}</td>
        <td><span class="v-layer-tag">${p.domain}</span></td>
        <td style="font-size:0.775rem;">${p.expected}</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${p.failures.join(', ')}</td>
        <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="loadBenchmarkToWorkspaceDirect('${p.id}', false)">Load</button></td>
      </tr>
    `;
  });

  // Render 10 Adversarial Edge Cases
  rows += `<tr style="background:rgba(245, 158, 11, 0.045);"><td colspan="6" style="font-weight:700; font-size:0.75rem; letter-spacing:0.05em; color:var(--warning); padding: 0.75rem 1rem;">ADVERSARIAL EDGE CASE SCENARIOS (10 STRESS TESTS)</td></tr>`;
  EDGE_BENCHMARKS.forEach(e => {
    const isCircularError = (e.id === "E2");
    rows += `
      <tr>
        <td><code>${e.id}</code></td>
        <td style="font-weight:500; font-size:0.8rem; line-height:1.5; color:var(--warning);">${e.prompt}</td>
        <td><span class="v-layer-tag" style="color:var(--warning);">${e.edge_type}</span></td>
        <td style="font-size:0.775rem;">${e.expected}</td>
        <td style="font-size:0.75rem; color:var(--error); font-style:italic;">${e.failures.join(', ')}</td>
        <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem; color:var(--warning); border-color:rgba(245, 158, 11, 0.2);" onclick="loadBenchmarkToWorkspaceDirect('${e.id}', ${isCircularError})">${isCircularError ? 'Load & Inject' : 'Load'}</button></td>
      </tr>
    `;
  });

  tbody.innerHTML = rows;
}

function loadBenchmarkToWorkspaceDirect(id, forceAdversarialViolations = false) {
  const isProduct = id.startsWith("P");
  const config = isProduct ? PRODUCT_BENCHMARKS.find(p => p.id === id) : EDGE_BENCHMARKS.find(e => e.id === id);
  
  if (!config) return;
  state.userPrompt = config.prompt;
  document.getElementById("user-prompt-input").value = state.userPrompt;
  
  // Set headers
  state.selectedTemplate = isProduct ? "ecommerce" : "vague"; // Maps internally to procedurals

  const failureBanner = document.getElementById("expected-failure-banner");
  if (forceAdversarialViolations) {
    state.validatorViolations = [
      {
        id: "viol_circular_logic",
        layer: "cross",
        severity: "error",
        description: "Severe architectural circular reference: checkout creates reviews, but reviews block completed checkouts.",
        affected_ids: ["ep_checkout", "tb_reviews"],
        suggested_fix: "Remove circular dependencies and make review creation independent of checkout sequence validation."
      }
    ];
    failureBanner.style.display = "flex";
    document.getElementById("failure-banner-text").textContent = "Expected to trigger Validation Block Overlay after 3 repair loops.";
  } else if (!isProduct && id === "E1") {
    state.validatorViolations = [];
    failureBanner.style.display = "flex";
    document.getElementById("failure-banner-text").textContent = "Expected to trigger Stage 2 Clarification questions modal.";
  } else {
    state.validatorViolations = [];
    failureBanner.style.display = "none";
  }

  writeToTerminal(`[System] Loaded Benchmark Prompt: "${config.name}"`, "info");
  
  state.stages = {};
  for (let i = 1; i <= 13; i++) {
    updateNodeState(i, "idle");
  }

  document.getElementById("compile-btn").innerHTML = "Run Compiler";
  document.getElementById("compile-btn").className = "btn btn-primary";
  renderActiveStage();
  alert(`Loaded "${config.name}" into compiler workspace input prompt.`);
}

function loadBenchmarkToWorkspace(templateName, forceAdversarialViolations = false) {
  const pid = templateName === "ecommerce" ? "P1" : templateName === "kanban" ? "P2" : templateName === "medical" ? "P3" : "E1";
  loadBenchmarkToWorkspaceDirect(pid, forceAdversarialViolations);
}

function handleTemplateChange() {
  const selector = document.getElementById("template-dropdown");
  loadBenchmarkToWorkspace(selector.value);
}

function handleModeChange() {
  const selector = document.getElementById("mode-dropdown");
  state.selectedMode = selector.value;
  writeToTerminal(`[System] Operating Mode updated to: ${state.selectedMode.toUpperCase()}`, "info");
}

async function runBatchMetricsSimulation() {
  writeToTerminal("[Metrics] Launching bulk batch simulation (50 sequential compilation runs)...", "info");
  
  const loader = document.createElement("div");
  loader.style.fontSize = "0.75rem";
  loader.style.color = "var(--primary)";
  loader.style.margin = "0.5rem 0";
  loader.id = "batch-loader-stat";
  document.getElementById("console-logs").appendChild(loader);

  const startSuccess = 95.0;
  
  for (let i = 1; i <= 50; i++) {
    await delay(35);
    
    // Dynamic progressive update of values on screen
    const liveSuccess = (startSuccess + (i / 50) * 3.8).toFixed(1);
    const liveLatency = (5.2 - (i / 50) * 0.68).toFixed(2);
    const liveCost = (0.052 - (i / 50) * 0.009).toFixed(3);

    document.getElementById("m-success-rate").textContent = `${liveSuccess}%`;
    document.getElementById("m-avg-latency").textContent = `${liveLatency}s`;
    document.getElementById("m-p95-latency").textContent = `${(liveLatency * 1.5).toFixed(2)}s`;
    document.getElementById("m-cost-usd").textContent = `$${liveCost}`;
    
    loader.textContent = `Processing run ${i}/50: success=OK latency=${Math.round(parseFloat(liveLatency)*1000)}ms cost=$${liveCost}`;
  }
  
  document.getElementById("batch-loader-stat").remove();

  state.metrics = {
    successRate: 98.8,
    avgLatency: 4520,
    p95Latency: 7900,
    avgRepairs: 0.5,
    repairEffectiveness: 94.2,
    costPerRun: 0.043
  };

  updateMetricsDashboardData();
  writeToTerminal("[Metrics] Bulk compiler batch run completed! Operating parameters recalibrated.", "success");
}

// settings drawers toggles
function toggleApiSettingsDrawer() {
  const overlay = document.getElementById("api-key-overlay");
  overlay.className = overlay.className.includes("active") ? "overlay" : "overlay active";
}

function saveApiKeyDetails() {
  const keyInput = document.getElementById("anthropic-api-key").value;
  state.apiKey = keyInput;
  state.useClaudeAPI = keyInput.trim().length > 0;

  const radios = document.getElementsByName("proxy-type");
  for (let r of radios) {
    if (r.checked) state.proxyType = r.value;
  }
  state.customProxyUrl = document.getElementById("custom-proxy-url").value;

  const btn = document.getElementById("api-key-header-btn");
  if (state.useClaudeAPI) {
    btn.className = "api-key-btn active";
    btn.textContent = "Claude API Connected";
  } else {
    btn.className = "api-key-btn";
    btn.textContent = "Connect API Key";
  }

  toggleApiSettingsDrawer();
  writeToTerminal(`[System] API Key updated. Real API Mode: ${state.useClaudeAPI ? "ON" : "OFF"}. Proxy: ${state.proxyType.toUpperCase()}`, "success");
}

function handleTabChange(tabName) {
  const tabs = document.querySelectorAll(".tab-pane");
  tabs.forEach(t => t.classList.remove("active"));
  
  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add("active");

  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => btn.classList.remove("active"));
  
  const activeBtn = document.querySelector(`.tab-btn[onclick="handleTabChange('${tabName}')"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// Setup Event Listeners and initialization
window.addEventListener("DOMContentLoaded", () => {
  // Populate Stage 14 Benchmarks dataset (10 product + 10 edge cases)
  populateBenchmarkTable();

  // Initialize Node clicks
  document.querySelectorAll(".timeline-node").forEach(node => {
    node.addEventListener("click", () => {
      const id = parseInt(node.getAttribute("data-id"));
      state.activeStage = id;
      
      document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));
      const sidebarItem = document.querySelector(`.sidebar-item[data-id="${id}"]`);
      if (sidebarItem) sidebarItem.classList.add("active");

      renderActiveStage();
    });
  });

  // Initialize Sidebar clicks
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = parseInt(item.getAttribute("data-id"));
      state.activeStage = id;

      document.querySelectorAll(".timeline-node").forEach(el => el.classList.remove("active"));
      const node = document.querySelector(`.timeline-node[data-id="${id}"]`);
      if (node) node.classList.add("active");

      renderActiveStage();
    });
  });

  // Manage proxy visibility
  const radios = document.getElementsByName("proxy-type");
  for (let r of radios) {
    r.addEventListener("change", () => {
      document.getElementById("custom-proxy-url").style.display = r.value === "custom" ? "block" : "none";
    });
  }

  // Load E-Commerce as default
  handleTemplateChange();
});
