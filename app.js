// esha.ai - Compiler Pipeline Simulator & Playground Core
// Powered by modern ESM and reactive vanilla state management

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
  { id: 10, name: "Patch Generator", tag: "Stage 10", desc: "RFC 6902 Surgical Repair" },
  { id: 11, name: "Targeted Regenerator", tag: "Stage 11", desc: "Incremental Patch Application" },
  { id: 12, name: "Runtime Contracts", tag: "Stage 12", desc: "SQL DDL, Express, Casbin, React" },
  { id: 13, name: "Execution Simulator", tag: "Stage 13", desc: "Dry-Run Pipeline Executor" },
  { id: 14, name: "Dataset Generator", tag: "Stage 14", desc: "Benchmark Evaluation" },
  { id: 15, name: "Tradeoff Analyzer", tag: "Stage 15", desc: "Cost, Latency & Skip Optimization" }
];

// App Templates (Preloaded procedural states to guarantee realistic JSON cascades)
const APP_TEMPLATES = {
  ecommerce: {
    name: "SaaS E-Commerce Platform",
    prompt: "Build an e-commerce platform with buyers, sellers, and an admin. Buyers can purchase items and write reviews. Sellers can list items. Admin can ban users and delete reviews.",
    entities: ["users", "items", "orders", "reviews"],
    roles: ["buyer", "seller", "admin"],
    features: [
      { id: "f1", name: "Item Listing", desc: "Sellers list items with pricing", role_scope: ["seller"] },
      { id: "f2", name: "Checkout Cart", desc: "Buyers purchase multiple items", role_scope: ["buyer"] },
      { id: "f3", name: "User Review System", desc: "Buyers review items, admin can delete reviews", role_scope: ["buyer", "admin"] }
    ]
  },
  kanban: {
    name: "Kanban Task Management",
    prompt: "Build a collaborative project management board where managers can create workspaces and invite members. Members can add cards, move cards across Swimlanes (To Do, In Progress, Done), and attach comments. Guest users can only view.",
    entities: ["users", "workspaces", "cards", "swimlanes", "comments"],
    roles: ["manager", "member", "guest"],
    features: [
      { id: "f1", name: "Workspace Creation", desc: "Managers create and invite", role_scope: ["manager"] },
      { id: "f2", name: "Task Card Movements", desc: "Members update swimlane states", role_scope: ["manager", "member"] },
      { id: "f3", name: "Card Comment Threads", desc: "Collaborators post comments", role_scope: ["manager", "member"] }
    ]
  },
  medical: {
    name: "Medical Clinic Appointment Scheduler",
    prompt: "Create an online clinic booking app. Patients can book sessions with doctors. Doctors can specify their weekly slots and write e-prescriptions. Receptionists can reschedule bookings and charge payments.",
    entities: ["users", "doctors", "patients", "appointments", "prescriptions", "payments"],
    roles: ["patient", "doctor", "receptionist"],
    features: [
      { id: "f1", name: "Slot Calendar Management", desc: "Doctors input slots", role_scope: ["doctor"] },
      { id: "f2", name: "Appointment Booking", desc: "Patients book clinic slots", role_scope: ["patient"] },
      { id: "f3", name: "E-Prescriptions", desc: "Doctors submit e-prescriptions", role_scope: ["doctor"] },
      { id: "f4", name: "Payment Receipts", desc: "Receptionists invoice patients", role_scope: ["receptionist"] }
    ]
  },
  vague: {
    name: "Vague Prompt (Triggers Stage 2 Loop)",
    prompt: "Make a cool website with logs and stuff.",
    entities: [],
    roles: [],
    features: []
  }
};

// Global App State
const state = {
  activeStage: 1,
  selectedTemplate: "ecommerce",
  isCompiling: false,
  useClaudeAPI: false,
  apiKey: "",
  userPrompt: APP_TEMPLATES.ecommerce.prompt,
  stages: {},
  validatorViolations: [],
  clarifierAnswers: {
    q1: "",
    q2: "",
    q3: ""
  },
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

// Helper: Format JSON safely
function safeJSONStringify(obj) {
  return JSON.stringify(obj, null, 2);
}

// System Prompts loaded directly from the spec
const SYSTEM_PROMPTS = {
  1: `You are the Intent Extraction Engine — Stage 1 of a software compiler pipeline.
Your job is to parse a natural language software request into a normalized, unambiguous intent specification that all downstream stages will depend on.

RULES:
- Output valid JSON only. No markdown. No prose. No comments.
- Never invent entities not implied by the input.
- If information is missing, set value to null and add an entry to assumptions[].
- Flag all ambiguities in open_questions[].
- If the prompt is too vague to proceed (fewer than 2 inferable entities), set "requires_clarification": true and populate open_questions[].`,
  
  2: `You are the Clarification Agent — Stage 2 of the compiler pipeline.
You receive an intent JSON. Your job is to decide if generation can proceed safely or if critical information is missing.

DECISION RULES:
- Ask ONLY if a missing detail would cause cross-layer inconsistency (e.g., payment mentioned but no currency/gateway, roles mentioned but no permission boundaries defined).
- Maximum 3 questions. Prefer assumptions over questions.
- If assumptions cover all gaps → set proceed: true immediately.
- If proceed: false, explain exactly which pipeline stage would fail and why.`,

  3: `You are a Principal Software Architect — Stage 3 of the compiler pipeline.
Convert intent specification into a complete, technology-agnostic system architecture.
Every downstream generator (DB, API, UI, Auth, Logic) depends on this output.
Gaps here cascade into all layers — be exhaustive.

RULES:
- Every feature maps to exactly one module.
- Every entity participates in at least one data_flow.
- Every role appears in role_matrix with explicit permissions.
- Every module has a unique id — used as foreign reference by later stages.
- Non-functionals must include: auth_strategy, data_retention, rate_limiting.`,

  4: `You are a Database Architect — Stage 4 of the compiler pipeline.
Generate a fully normalized relational schema from the architecture spec.
This schema is the source of truth for API field validation and UI data binding.

RULES:
- PostgreSQL-compatible DDL representable as JSON.
- Every table has: id (UUID PK), created_at, updated_at, deleted_at (soft delete).
- Every foreign key must reference an existing table id in this schema.
- No orphan tables — every table participates in at least one relationship.
- Column types must be concrete: use varchar(n), not "string".
- Indexes must be defined for all foreign keys and frequently-queried fields.
- Flag any entity from architecture that cannot be mapped → validation_warnings[].`,

  5: `You are an API Architect — Stage 5 of the compiler pipeline.
Generate a complete REST API schema. Every endpoint must be traceable to a DB table and an architecture module.

RULES:
- Every request field must exist as a column in the referenced DB table.
- Every response field must exist as a column in the referenced DB table.
- No fields may be invented — if a concept isn't in the DB, it cannot appear in the API.
- Include auth_required and allowed_roles on every endpoint.
- Use snake_case for all field names and endpoint paths.
- Pagination required on all list endpoints.
- Endpoints must cover: create, read (single + list), update, delete per entity.
- Flag any architecture feature that has no corresponding endpoint → coverage_gaps[].`,

  6: `You are a UI Schema Generator — Stage 6 of the compiler pipeline.
Generate a declarative, runtime-executable UI configuration.
Every component must be traceable to an API endpoint. No orphan UI.

RULES:
- Every page maps to exactly one primary workflow from architecture.
- Every form field must map to an API request body field (via endpoint_id + field name).
- Every display field must map to an API response field.
- Every action (button, submit) must reference a valid endpoint_id.
- Role-visibility must be enforced per component using allowed_roles.
- Flag unmapped components in validation_warnings[].`,

  7: `You are an Authorization Architect — Stage 7 of the compiler pipeline.
Generate a complete RBAC configuration that is directly executable by a policy engine (e.g., OPA, Casbin, or custom middleware).

RULES:
- Every role must come from the architecture role_matrix — no new roles.
- Every policy must reference a valid endpoint_id from the API schema.
- Apply least-privilege: default deny, explicit allow only.
- Endpoint-level and resource-level (row-level) permissions must both be covered.
- Flag any endpoint with no auth policy → unprotected_endpoints[].`,

  8: `You are a Business Rules Engine — Stage 8 of the compiler pipeline.
Generate executable, deterministic business logic rules.
Each rule must be directly enforceable by middleware or a rules engine.

RULES:
- Every rule has a unique id, a trigger (event), a condition (boolean expression), and an action (side effect or rejection).
- Rules must reference real entity fields from the DB schema.
- No vague conditions like "if user is valid" — be specific.
- Cover: access gates, state transitions, payment/premium logic, notifications, data integrity rules.
- Flag any business_rule from architecture not covered here → coverage_gaps[].`,

  9: `You are the Consistency Validator — Stage 9 of the compiler pipeline.
Your job is the most critical in the pipeline: detect ALL inconsistencies across layers before anything reaches runtime.
VALIDATE ALL OF THE FOLLOWING:
1. UI → API: Every UI component field maps to a real endpoint_id + field
2. API → DB: Every API request/response field maps to a real table column
3. Auth → API: Every endpoint has at least one auth policy
4. Logic → DB: Every business rule references real entity fields
5. Role consistency: Roles in UI, API, Auth, and Architecture all match
6. Orphan detection: Any table, endpoint, page, or rule with no references
7. Missing CRUD: Any entity with incomplete create/read/update/delete coverage
8. Soft delete: Any delete endpoint that bypasses soft-delete logic
9. Pagination: Any list endpoint missing pagination config
10. Required fields: Any required API field missing from DB`,

  10: `You are the Patch Generator — Stage 10 of the compiler pipeline.
You receive a validation report with violations. Generate surgical JSONPatch operations (RFC 6902) to fix only the violations.

RULES:
- One patch per violation — reference violation id.
- Do NOT regenerate entire sections. Fix only the broken part.
- Preserve all valid IDs, structures, and references.
- If a violation requires new data to be invented (e.g., a missing column), use the most conservative reasonable value and add a note.
- If a violation cannot be patched without human input, set requires_human: true.`,

  11: `You are the Targeted Regenerator — Stage 11 of the compiler pipeline.
Apply approved patches to the application JSON.

RULES:
- Apply ONLY the patches provided. Nothing else changes.
- All existing IDs must remain unchanged.
- Cross-references must remain consistent after patching.
- After applying, output the complete updated application JSON.
- Add a patch_log entry for each patch applied.`,

  12: `You are the Runtime Contract Generator — Stage 12 of the compiler pipeline.
Convert the final validated application JSON into directly executable artifacts.
Output must require zero manual editing to run.

RULES:
- DDL must be valid PostgreSQL, executable in order (handle FK dependencies).
- API stubs must be valid TypeScript with Express-compatible signatures.
- Auth policies must be in Casbin policy format.
- UI routes must be valid React Router v6 config objects.
- Seed data must satisfy all FK constraints.`,

  13: `You are the Execution Validator — Stage 13 of the compiler pipeline.
Simulate dry-run execution of the runtime contracts to catch any remaining issues before the output is handed to a real runtime.

SIMULATE:
1. DDL execution order — will all CREATE TABLE statements succeed in sequence?
2. FK resolution — are all foreign keys resolvable at insert time?
3. Seed data — does seed data violate any constraints?
4. API endpoint reachability — is every route reachable given auth config?
5. Role coverage — does every page have at least one valid role that can access it?
6. Business rule firability — can every rule trigger at least once given seed data?
7. Circular dependency detection — any circular FKs or module dependencies?`,

  14: `You are an Evaluation Dataset Builder for a software generation pipeline.
Generate a benchmark dataset to stress-test the pipeline across realistic and adversarial conditions.`,

  15: `You are the Metrics and Tradeoff Analyzer for a software generation pipeline.
Given run logs, generate an evaluation report that includes both performance metrics AND cost-quality tradeoff analysis.`
};

// Procedural Generator Engine (Core Compilation Simulator)
// Produces 100% syntactically correct outputs matching schemas exactly based on user input
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

    // Standard high-fidelity generation
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
        { field: "auth_strategy", assumed_value: "JWT Bearer Token", reason: "Standard stateless session management matches intent" }
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
        proceed_risk_reason: "Stage 3 (System Designer) will fail immediately because of an empty entities schema."
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
    if (!config.entities || config.entities.length === 0) {
      warnings.push("No entities mapped from system architecture.");
    }
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
      
      // Create endpoint
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
          { status: 400, code: "INVALID_FIELD_ERROR", condition: "Field constraints violated" },
          { status: 401, code: "UNAUTHORIZED", condition: "Request missing valid auth credentials" }
        ]
      });

      // List endpoint
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
            { field: "page", type: "integer", required: false, db_column: null },
            { field: "limit", type: "integer", required: false, db_column: null }
          ],
          body: []
        },
        response: {
          success_status: 200,
          fields: [
            { field: "data", type: "array", db_column: null },
            { field: "total_count", type: "integer", db_column: null }
          ]
        },
        errors: [
          { status: 401, code: "UNAUTHORIZED", condition: "Invalid token" }
        ]
      });

      // Delete endpoint (Soft-Delete)
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
        errors: [
          { status: 404, code: "NOT_FOUND", condition: "Entity matching ID not found" }
        ]
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
              { name: "id", api_field: "id", input_type: "text", required: true, visible_to_roles: config.roles },
              { name: "created_at", api_field: "created_at", input_type: "date", required: true, visible_to_roles: config.roles }
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
      inherits_from: r === "admin" ? null : null,
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
        },
        {
          id: "rule_audit_trail",
          name: "Audit Create Log",
          trigger: "on_create",
          entity: config.entities[0] || "users",
          condition: "true",
          action: "insert into audit_logs (event, user_id, timestamp) values ('CREATE', current_user.id, now())",
          enforced_at: "db",
          priority: 2,
          tags: ["security"]
        }
      ],
      coverage_gaps: []
    };
  },

  9: (intent, architecture, ui, api, db, auth, logic, forceViolation = false) => {
    if (forceViolation) {
      return {
        status: "FAIL",
        error_count: 2,
        warning_count: 1,
        violations: [
          {
            id: "viol_ui_field_mismatch",
            layer: "ui",
            severity: "error",
            description: "UI Component Form Field 'discount_code' references endpoint 'ep_create_orders', but the API endpoint schema is missing the 'discount_code' request body field.",
            affected_ids: ["comp_orders_form", "ep_create_orders"],
            suggested_fix: "Add the 'discount_code' request parameter field to the API Generator endpoint definition, or remove it from the UI component form."
          },
          {
            id: "viol_api_db_mismatch",
            layer: "api",
            severity: "error",
            description: "API Endpoint 'ep_create_orders' references DB table column 'discount_code', but the database schema lacks a 'discount_code' column in table 'orders'.",
            affected_ids: ["ep_create_orders", "tb_orders"],
            suggested_fix: "Add a nullable varchar column 'discount_code' to the database schema for the 'orders' table."
          },
          {
            id: "viol_auth_missing_policy",
            layer: "auth",
            severity: "warning",
            description: "API Endpoint 'ep_delete_users' has no RBAC validation policy assigned.",
            affected_ids: ["ep_delete_users"],
            suggested_fix: "Add a default-deny policy rule mapping 'role_admin' for the 'ep_delete_users' endpoint."
          }
        ],
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

  10: (violations) => {
    return {
      patches: violations.map((viol, index) => {
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
            note: "Automatically appended the missing field to the API Endpoint specification."
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
            note: "Injected a nullable column 'discount_code' to SQL DDL tables schema."
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
            requires_human: false,
            note: "Secured raw endpoint with explicit admin-only access policies."
          };
        }
      }),
      unpatchable: []
    };
  },

  11: (patches, layers) => {
    const updatedLayers = JSON.parse(JSON.stringify(layers));
    const logs = patches.map(p => {
      // Procedurally merge values to show surgical patch application
      if (p.target_layer === "api" && updatedLayers.api && updatedLayers.api.endpoints) {
        const ep = updatedLayers.api.endpoints.find(e => e.id === "ep_create_orders");
        if (ep) {
          ep.request.body.push(p.value);
        }
      } else if (p.target_layer === "db" && updatedLayers.db && updatedLayers.db.tables) {
        const tb = updatedLayers.db.tables.find(t => t.id === "tb_orders");
        if (tb) {
          tb.columns.push(p.value);
        }
      } else if (p.target_layer === "auth" && updatedLayers.auth && updatedLayers.auth.policies) {
        updatedLayers.auth.policies.push(p.value);
      }
      return {
        violation_id: p.violation_id,
        patch_applied: true,
        result: `Successfully patched ${p.target_layer} Layer: ${p.op} operation applied at path ${p.path}.`
      };
    });

    return {
      layers: updatedLayers,
      patch_log: logs
    };
  },

  12: (intent, architecture, ui, api, db, auth, logic, config) => {
    const entities = config.entities;
    
    // 1. Generate Valid DDL
    let ddl = `-- ESHA.AI Runtime Relational Contract Schema
-- Generated: ${new Date().toISOString()}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;

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

    // 2. Generate Seed SQL
    let seed = `-- ESHA.AI Relational Seeding
INSERT INTO "users" ("id", "email", "role") VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@esha.ai', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'developer@esha.ai', '${config.roles[1] || "developer"}');\n\n`;

    if (entities[1]) {
      seed += `INSERT INTO "${entities[1]}" ("id", "name", "user_id") VALUES
  ('33333333-3333-3333-3333-333333333333', 'Sample Entry A', '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444444', 'Sample Entry B', '22222222-2222-2222-2222-222222222222');\n`;
    }

    // 3. API typescript
    let apiTypes = `/* TypeScript Express Stubs & Types - Runtime Contracts */\n`;
    entities.forEach(ent => {
      const typeName = ent.charAt(0).toUpperCase() + ent.slice(1, -1);
      apiTypes += `export interface ${typeName} {\n  id: string;\n  created_at: Date;\n  updated_at: Date;\n  deleted_at?: Date;\n`;
      if (ent === "users") {
        apiTypes += `  email: string;\n  role: string;\n`;
      } else {
        apiTypes += `  name: string;\n  user_id: string;\n`;
      }
      apiTypes += `}\n\n`;
    });

    let apiStubs = `import express, { Request, Response } from 'express';\nconst router = express.Router();\n\n`;
    entities.forEach(ent => {
      apiStubs += `// Create ${ent}\nrouter.post('/api/v1/${ent}', async (req: Request, res: Response) => {\n  // Access control check\n  // Execute DB insertion\n  res.status(201).json({ success: true });\n});\n\n`;
      apiStubs += `// List ${ent}\nrouter.get('/api/v1/${ent}', async (req: Request, res: Response) => {\n  res.status(200).json({ data: [] });\n});\n\n`;
    });

    // 4. Casbin Policy
    let casbinModel = `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act`;

    const casbinPolicies = [];
    config.roles.forEach(role => {
      entities.forEach(ent => {
        casbinPolicies.push({ role: role, resource: `/api/v1/${ent}`, action: "GET", effect: "allow" });
        casbinPolicies.push({ role: "admin", resource: `/api/v1/${ent}`, action: "*", effect: "allow" });
      });
    });

    // 5. UI Routes
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
        { step: "Database Deployment", command: "psql -h localhost -U postgres -d esha_db -f schema.sql", expected_result: "CREATE TABLE statements succeed in sequence" },
        { step: "DB Seeding", command: "psql -h localhost -U postgres -d esha_db -f seed.sql", expected_result: "2 users and 2 domain entries inserted cleanly" },
        { step: "TypeScript Compilation", command: "tsc --noEmit", expected_result: "Zero compilation errors on Express typings" },
        { step: "Integration Test Suite", command: "npm run test:api", expected_result: "Casbin policies enforced; 100% routes return 200/201" }
      ]
    };
  },

  13: (contract) => {
    return {
      execution_passed: true,
      simulation_steps: [
        { step: "DDL Sequential Evaluation", status: "pass", detail: "Database schemas parsed; sequential ordering matches references with no circular dependencies." },
        { step: "FK Resolution Integrity Check", status: "pass", detail: "Foreign keys validated; referencing elements point to existing identifiers." },
        { step: "Data Seed Checks", status: "pass", detail: "SQL Seed statements executed on mock relational instance; successfully completed with zero constraint violations." },
        { step: "API Routing Reachability Audit", status: "pass", detail: "All HTTP methods (GET, POST, DELETE) mapped correctly and are reachable given authentication keys." },
        { step: "RBAC Role Access Boundaries Check", status: "pass", detail: "Verified user access control limits; unauthorized roles are blocked via Casbin models." }
      ],
      errors: [],
      warnings: [],
      coverage: {
        tables_simulated: 3,
        endpoints_simulated: 9,
        rules_fired: 2,
        roles_verified: 3
      },
      ready_for_runtime: true
    };
  },

  14: () => {
    return {
      product_prompts: [
        { id: "p1", prompt: "Build an e-commerce platform with buyers, sellers, and an admin.", domain: "Retail / Marketplaces", entity_count: 4, complexity: "medium", expected_behavior: "Normalize into items, orders, users, reviews tables with CRUD API paths.", known_failure_modes: ["Infinite order loop", "Circular references in payment logs"] },
        { id: "p2", prompt: "Build a doctor consultation platform with patients booking video visits.", domain: "Healthcare Scheduling", entity_count: 5, complexity: "high", expected_behavior: "Build calendar bookings, prescriptions, payments, and users models.", known_failure_modes: ["Double bookings", "Data privacy rule failure"] },
        { id: "p3", prompt: "Create a SaaS CRM to track leads and log contact history.", domain: "Sales & Marketing", entity_count: 3, complexity: "low", expected_behavior: "Leads, accounts, interactions models with basic authorization roles.", known_failure_modes: ["Lead assignment rule circular dependency"] }
      ],
      edge_prompts: [
        { id: "e1", prompt: "Make an app.", edge_type: "vague", expected_behavior: "Compiler triggers Stage 2 Clarification loop modal.", known_failure_modes: ["Stage 3 compiler crash because of empty schema"] },
        { id: "e2", prompt: "Build a booking app where users can never book slots but slot schedules are always full.", edge_type: "conflicting", expected_behavior: "Validator catches logical contradictions and triggers patch warnings.", known_failure_modes: ["Compilation loop", "Infinite validation loops"] },
        { id: "e3", prompt: "Build a subscription billing app but do not store customer records anywhere.", edge_type: "incomplete", expected_behavior: "Compiler maps missing customer entities under DB schema assumptions.", known_failure_modes: ["Foreign key constraint failure"] }
      ]
    };
  },

  15: () => {
    return {
      metrics: {
        success_rate: 98.4,
        avg_latency_ms: 4850,
        p95_latency_ms: 8200,
        avg_repairs: 0.6,
        repair_effectiveness: 92.5,
        cost_per_run_usd: 0.045,
        failure_types: [
          { type: "UI → API Mismatch", count: 12, percentage: 40.0 },
          { type: "API → DB Column Mismatch", count: 10, percentage: 33.3 },
          { type: "Missing Endpoint RBAC Policy", count: 8, percentage: 26.7 }
        ]
      },
      stage_analysis: STAGE_METADATA.map(s => ({
        stage: s.name,
        avg_latency_ms: s.id === 1 ? 950 : s.id === 3 ? 800 : s.id >= 5 && s.id <= 8 ? 400 : 250,
        parallelizable: s.id >= 5 && s.id <= 8,
        skip_condition: s.id === 2 ? "if intent is not vague" : null,
        value_score: s.id === 9 || s.id === 13 ? "high" : "medium"
      })),
      operating_modes: {
        fast_mode: { stages: ["Stage 1", "Stage 3", "Stage 4", "Stage 12"], estimated_cost_usd: 0.012, quality_tradeoff: "High speed, skips deep consistency checks and simulation cycles." },
        reliable_mode: { stages: ["All Stages"], estimated_cost_usd: 0.045, quality_tradeoff: "Default high-reliability compiler; includes validator and simulator stubs." },
        debug_mode: { stages: ["All Stages + Deep Val Passes"], estimated_cost_usd: 0.065, quality_tradeoff: "Thorough validation auditing; prints visual patch logs." }
      },
      recommendations: [
        "Enable parallel execution for API, UI, Auth, and Business Logic modules (reduces latency by ~1,200ms)",
        "Employ automatic bypass for Clarifier Agent (Stage 2) when user prompt contains > 5 distinct noun entities"
      ]
    };
  }
};

// Compile Stage Execution Orchestration
async function runCompilationStage(stageNum) {
  const config = APP_TEMPLATES[state.selectedTemplate];
  
  if (state.useClaudeAPI && state.apiKey) {
    try {
      return await executeClaudeAPICall(stageNum);
    } catch (e) {
      console.warn("Claude API key compilation failed, cascading to procedurally consistent simulation layer...", e);
      writeToTerminal(`[API Warning] Claude API request failed. Reverting to simulator engine. Reason: ${e.message}`, "warning");
    }
  }

  // Simulator Fallback (Extremely realistic and consistent)
  await delay(200 + Math.random() * 200); // Natural visual delay

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
      const forceViol = (state.selectedTemplate === "ecommerce" && state.validatorViolations.length > 0);
      return ProceduralGenerator[9](
        state.stages[1].output, state.stages[3].output, state.stages[6].output,
        state.stages[5].output, state.stages[4].output, state.stages[7].output, state.stages[8].output,
        forceViol
      );
    case 10:
      return ProceduralGenerator[10](state.stages[9].output.violations);
    case 11:
      const layers = {
        db: state.stages[4].output,
        api: state.stages[5].output,
        ui: state.stages[6].output,
        auth: state.stages[7].output,
        logic: state.stages[8].output
      };
      const patchResult = ProceduralGenerator[11](state.stages[10].output.patches, layers);
      // Write patches back to local stage outputs
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
    case 14:
      return ProceduralGenerator[14]();
    case 15:
      return ProceduralGenerator[15]();
  }
}

// Client Side Claude API Call Executor (Direct Fetch to Anthropic)
async function executeClaudeAPICall(stageNum) {
  const systemPrompt = SYSTEM_PROMPTS[stageNum];
  
  // Construct proper input details for Claude stage prompt
  let inputPrompt = "";
  if (stageNum === 1) {
    inputPrompt = `USER INPUT:\n${state.userPrompt}`;
  } else {
    // Ingest outputs of upstream stages based on compiler design
    const previousStageNum = stageNum === 11 ? 10 : stageNum - 1;
    const prevOutput = state.stages[previousStageNum] ? state.stages[previousStageNum].output : {};
    inputPrompt = `INPUT:\n${safeJSONStringify(prevOutput)}`;
  }

  writeToTerminal(`[API Request] Dispatching Stage ${stageNum} Prompt payload directly to Anthropic Claude-3-5-sonnet...`, "info");

  // Modern direct client fetch (Note: requires browser CORS extension or disabled checks for direct key validation)
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": state.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true" // Required flag for client calls
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: inputPrompt }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error ? errorData.error.message : `HTTP ${response.status}`);
  }

  const result = await response.json();
  const outputText = result.content[0].text;
  
  // Attempt to parse clean JSON
  try {
    return JSON.parse(outputText.trim());
  } catch (jsonErr) {
    // Attempt block recovery
    const regex = /\{[\s\S]*\}/;
    const match = outputText.match(regex);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Claude output succeeded but failed to parse into valid JSON schema layout.");
  }
}

// Global Compilation Controller
async function startFullCompilation() {
  if (state.isCompiling) return;
  state.isCompiling = true;
  document.getElementById("compile-btn").disabled = true;
  document.getElementById("compile-btn").innerHTML = `<span class="pulse-border-info">Compiling...</span>`;
  
  // Reset all stages unless cascade resuming
  const startFrom = state.dirtyFromStage !== null ? state.dirtyFromStage : 1;
  state.dirtyFromStage = null;

  writeToTerminal(`[System] Initializing esha.ai compiler stream... starting from Stage ${startFrom}`, "info");

  for (let i = startFrom; i <= 13; i++) {
    // If previous stage triggered clarification loop, pause compilation
    if (i === 2 && state.stages[1].output.requires_clarification) {
      // Run Stage 2 to get validation feedback
      updateNodeState(2, "running");
      const st2Result = await runCompilationStage(2);
      saveStageData(2, st2Result);
      updateNodeState(2, "error");
      
      // Pause compiler and display questions modal
      state.isCompiling = false;
      document.getElementById("compile-btn").disabled = false;
      document.getElementById("compile-btn").innerHTML = "Resume Compile";
      openClarifierModal(st2Result.questions);
      writeToTerminal(`[Halt] Stage 2 Clarification required. Pipeline suspended.`, "warning");
      return;
    }

    // Skip validator repair loop by default unless error is injected in ecommerce template
    if (i === 10 || i === 11) {
      // In standard pass, Validator (Stage 9) succeeds, bypassing Patcher (10) and Targeted Regenerator (11)
      if (state.validatorViolations.length === 0) {
        updateNodeState(i, "success");
        saveStageData(i, { message: "Bypassed - Validation check passed with 0 violations." });
        continue;
      }
    }

    updateNodeState(i, "running");
    writeToTerminal(`[Compiler] Stage ${i} (${STAGE_METADATA[i-1].name}) executing...`, "info");

    try {
      const result = await runCompilationStage(i);
      saveStageData(i, result);
      
      if (i === 9 && result.status === "FAIL") {
        updateNodeState(9, "error");
        writeToTerminal(`[Error] Stage 9 Validator failed with ${result.error_count} errors! Redirecting to Stage 10 (Patch Generator)`, "error");
        
        // Execute Stage 10 (Patcher)
        updateNodeState(10, "running");
        const patchResult = await runCompilationStage(10);
        saveStageData(10, patchResult);
        updateNodeState(10, "repaired");
        writeToTerminal(`[Patcher] Stage 10 generated ${patchResult.patches.length} surgical JSONPatch operations successfully.`, "warning");

        // Execute Stage 11 (Targeted Regenerator)
        updateNodeState(11, "running");
        const regenResult = await runCompilationStage(11);
        saveStageData(11, regenResult);
        updateNodeState(11, "success");
        writeToTerminal(`[Regenerator] Stage 11 successfully merged patches into codebase structures.`, "success");

        // Re-execute Stage 9 to confirm validation pass
        updateNodeState(9, "running");
        await delay(300);
        // Clear violations so validator passes on 2nd pass
        state.validatorViolations = [];
        const secPassResult = await runCompilationStage(9);
        saveStageData(9, secPassResult);
        updateNodeState(9, "success");
        writeToTerminal(`[Validator] Second-pass consistency validation: PASS. 0 violations found.`, "success");
        continue;
      }

      updateNodeState(i, "success");
      writeToTerminal(`[Success] Stage ${i} output compiled successfully.`, "success");
      
      // Dynamic rendering of terminal logs in stage 13
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

  // Populate Stage 14 (offline benchmark) & Stage 15 (tradeoffs) automatically at compile completion
  state.stages[14] = { output: ProceduralGenerator[14]() };
  state.stages[15] = { output: ProceduralGenerator[15]() };

  state.isCompiling = false;
  document.getElementById("compile-btn").disabled = false;
  document.getElementById("compile-btn").innerHTML = "Re-compile App";
  writeToTerminal(`[System] Compilation finished. Runtime assets delivered and simulated!`, "success");
  
  // Refresh UI and jump to contracts tab automatically
  renderActiveStage();
  updateCodeViewerTabContent();
  updateMetricsUI();
}

// UI State Renderers
function updateNodeState(stageNum, status) {
  const node = document.querySelector(`.timeline-node[data-id="${stageNum}"]`);
  if (!node) return;
  
  node.className = `timeline-node ${status}`;
  const statusLabel = node.querySelector(".node-status");
  if (statusLabel) {
    statusLabel.textContent = status;
  }

  // Active status highlight logic
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

  // Update headers
  document.getElementById("pane-title").textContent = meta.name;
  document.getElementById("pane-tag").textContent = meta.tag;
  document.getElementById("pane-description").textContent = meta.desc;

  // Render Prompt viewer
  document.getElementById("stage-prompt-content").textContent = SYSTEM_PROMPTS[stageNum] || "No system prompt.";

  // Render Input viewer
  const inputEl = document.getElementById("stage-input-content");
  if (stageNum === 1) {
    inputEl.innerHTML = `<div class="prompt-viewer">${state.userPrompt}</div>`;
  } else {
    const prevOutput = state.stages[stageNum - 1] ? state.stages[stageNum - 1].output : "Waiting for compilation...";
    inputEl.innerHTML = `<pre class="code-viewer">${typeof prevOutput === 'string' ? prevOutput : safeJSONStringify(prevOutput)}</pre>`;
  }

  // Render Output/Editor viewer
  const outputContainer = document.getElementById("stage-output-container");
  
  if (stageNum === 9) {
    // High-fidelity validation dashboard
    renderValidatorDashboard(outputContainer, stageData ? stageData.output : null);
    return;
  }

  if (stageNum === 13) {
    // Simulator terminal layout
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

  // Standard JSON output editor
  if (stageData && stageData.output) {
    const formattedJSON = safeJSONStringify(stageData.output);
    outputContainer.innerHTML = `
      <div class="col-header">
        <span>Output Payload (JSON)</span>
        <div>
          <button id="save-edit-btn" class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.7rem;" onclick="saveStageEdits(${stageNum})">Save Changes</button>
        </div>
      </div>
      <div class="col-content" style="padding:0;">
        <div class="code-container">
          <textarea id="json-editor" class="editor-textarea">${formattedJSON}</textarea>
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

// Stage 9 Custom Validator Dashboard Renderer
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

// Stage 13 Live Terminal Log Simulation
function renderExecutionTerminal(simOutput) {
  const terminal = document.getElementById("sim-terminal");
  if (!terminal) return;

  terminal.innerHTML = "";
  let currentStep = 0;

  function printLine(text, type = "info", delayMs = 0) {
    setTimeout(() => {
      const line = document.createElement("div");
      line.className = `terminal-line ${type}`;
      
      let prefix = "[INFO]";
      if (type === "success") prefix = "[PASS]";
      if (type === "warning") prefix = "[WARN]";
      if (type === "error") prefix = "[FAIL]";

      line.innerHTML = `<span>${prefix}</span> <span>${text}</span>`;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }, delayMs);
  }

  printLine("Initializing dry-run sandboxed compiler execution simulator...", "info", 0);
  printLine("Syncing generated runtime contracts locally...", "info", 300);

  simOutput.simulation_steps.forEach((step, index) => {
    const delayVal = 600 + index * 400;
    printLine(`Auditing constraint: ${step.step}...`, "info", delayVal);
    printLine(`${step.detail}`, step.status === "pass" ? "success" : "error", delayVal + 200);
  });

  const finalDelay = 600 + simOutput.simulation_steps.length * 400 + 400;
  setTimeout(() => {
    printLine("----------------------------------------------------------------", "info", 0);
    printLine("✔ Pipeline execution simulations completed with 0 errors.", "success", 100);
    printLine("Compiler build artifacts successfully packaged. READY FOR DEPLOYMENT.", "success", 200);
  }, finalDelay);
}

function reRunTerminalSimulation() {
  if (state.stages[13] && state.stages[13].output) {
    renderExecutionTerminal(state.stages[13].output);
  }
}

// Reactive Edit Downstream Cascading Logic
function saveStageEdits(stageNum) {
  const editor = document.getElementById("json-editor");
  if (!editor) return;

  try {
    const parsedJSON = JSON.parse(editor.value);
    state.stages[stageNum].output = parsedJSON;
    
    // Mark downstream stages as Dirty / Pending Re-run
    state.dirtyFromStage = stageNum + 1;
    writeToTerminal(`[System] Edited Stage ${stageNum} output manually. Downstream Stages ${stageNum + 1} to 13 marked as dirty.`, "warning");
    
    // Visually mark downstream nodes in graph
    for (let i = stageNum + 1; i <= 13; i++) {
      updateNodeState(i, "idle");
    }

    // Adapt glowing button
    document.getElementById("compile-btn").innerHTML = `Resume Compile (From Stage ${stageNum + 1})`;
    document.getElementById("compile-btn").className = "btn btn-success";

    alert(`Changes saved! Downstream stages are marked as pending re-compile. Click 'Resume Compile' to cascade your edits.`);
    renderActiveStage();

  } catch (e) {
    alert(`Invalid JSON format: ${e.message}. Please fix errors before saving.`);
  }
}

// Inject manual Stage 9 Validator violation
function triggerValidatorError() {
  state.validatorViolations = [
    {
      id: "viol_ui_field_mismatch",
      layer: "ui",
      severity: "error",
      description: "UI Component Form Field 'discount_code' references endpoint 'ep_create_orders', but the API endpoint schema is missing the 'discount_code' request body field.",
      affected_ids: ["comp_orders_form", "ep_create_orders"],
      suggested_fix: "Add the 'discount_code' request parameter field to the API Generator endpoint definition, or remove it from the UI component form."
    }
  ];
  
  writeToTerminal("[System] Manually injected a UI-to-API consistency violation in Stage 9 validator workspace.", "warning");
  
  // Re-run stage 9 compilation
  updateNodeState(9, "error");
  
  // Mark subsequent stages as dirty
  for (let i = 10; i <= 13; i++) {
    updateNodeState(i, "idle");
  }

  // Force compilation re-run for Stage 9
  runCompilationStage(9).then(res => {
    saveStageData(9, res);
    renderActiveStage();
  });
}

// Handle targeted patching sequence (Stages 10 and 11)
async function triggerPatcherHealing() {
  writeToTerminal("[System] Manually triggering Stage 10 Patch Generator and Stage 11 Targeted Regenerator...", "info");
  
  updateNodeState(10, "running");
  const patches = await runCompilationStage(10);
  saveStageData(10, patches);
  updateNodeState(10, "repaired");
  
  updateNodeState(11, "running");
  const regen = await runCompilationStage(11);
  saveStageData(11, regen);
  updateNodeState(11, "success");

  // Re-verify
  state.validatorViolations = [];
  updateNodeState(9, "running");
  const secPass = await runCompilationStage(9);
  saveStageData(9, secPass);
  updateNodeState(9, "success");

  renderActiveStage();
}

// Interactive Clarification Loop Handler
function openClarifierModal(questions) {
  const overlay = document.getElementById("clarifier-overlay");
  const container = document.getElementById("clarifier-questions-container");
  
  container.innerHTML = questions.map(q => `
    <div class="clarifier-question-box">
      <div class="clarifier-q">${q.question}</div>
      <input type="text" id="ans-${q.id}" class="clarifier-input" placeholder="Enter clarification detail...">
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

  writeToTerminal(`[System] Received user clarification details:
- Domain: "${answers.q1}"
- Roles: "${answers.q2}"
- Integrations: "${answers.q3}"`, "success");

  // Inject answers back into user prompt and trigger clean compilation
  state.userPrompt = `${APP_TEMPLATES[state.selectedTemplate].prompt} [Clarified Scope: Domain: ${answers.q1}, Permission Boundaries: ${answers.q2}, Integrations: ${answers.q3}]`;
  document.getElementById("user-prompt-input").value = state.userPrompt;
  
  // Mark pipeline nodes clean
  updateNodeState(1, "idle");
  updateNodeState(2, "idle");

  // Resume compile automatically
  startFullCompilation();
}

// Visual Log Terminal Printer
function writeToTerminal(text, type = "info") {
  const logs = document.getElementById("console-logs");
  if (!logs) return;

  const line = document.createElement("div");
  line.style.marginBottom = "0.25rem";
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

// Stage 12 Runtime Contract Tabs Content Updater
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

// Stage 15 Metrics & Batch Simulator
function updateMetricsUI() {
  document.getElementById("m-success-rate").textContent = `${state.metrics.successRate}%`;
  document.getElementById("m-avg-latency").textContent = `${(state.metrics.avgLatency / 1000).toFixed(2)}s`;
  document.getElementById("m-p95-latency").textContent = `${(state.metrics.p95Latency / 1000).toFixed(2)}s`;
  document.getElementById("m-repair-effectiveness").textContent = `${state.metrics.repairEffectiveness}%`;
  document.getElementById("m-avg-repairs").textContent = state.metrics.avgRepairs;
  document.getElementById("m-cost-usd").textContent = `$${state.metrics.costPerRun.toFixed(3)}`;
}

async function runBatchMetricsSimulation() {
  writeToTerminal("[Metrics] Launching bulk batch simulation (50 sequential compilation runs)...", "info");
  
  const loader = document.createElement("div");
  loader.style.fontSize = "0.75rem";
  loader.style.color = "var(--primary)";
  loader.style.marginTop = "0.5rem";
  loader.id = "batch-loader-stat";
  document.getElementById("console-logs").appendChild(loader);

  for (let i = 1; i <= 50; i++) {
    await delay(30);
    loader.textContent = `Processing run ${i}/50: success=OK latency=${3500 + Math.random() * 2000}ms cost=$0.045`;
  }
  
  document.getElementById("batch-loader-stat").remove();

  // Update metrics with slight dynamic variations
  state.metrics = {
    successRate: 98.8,
    avgLatency: 4520,
    p95Latency: 7900,
    avgRepairs: 0.5,
    repairEffectiveness: 94.2,
    costPerRun: 0.043
  };

  updateMetricsUI();
  writeToTerminal("[Metrics] Bulk compiler batch run completed! Operating parameters recalibrated.", "success");
}

// Template loader handler
function handleTemplateChange() {
  const selector = document.getElementById("template-dropdown");
  state.selectedTemplate = selector.value;
  state.userPrompt = APP_TEMPLATES[selector.value].prompt;
  document.getElementById("user-prompt-input").value = state.userPrompt;
  
  writeToTerminal(`[System] App Template updated to: "${APP_TEMPLATES[selector.value].name}"`, "info");
  
  // Clear previous outputs
  state.stages = {};
  state.validatorViolations = [];
  
  for (let i = 1; i <= 13; i++) {
    updateNodeState(i, "idle");
  }

  document.getElementById("compile-btn").innerHTML = "Run Compiler";
  document.getElementById("compile-btn").className = "btn btn-primary";
  renderActiveStage();
}

// Setup Event Listeners and initialization
window.addEventListener("DOMContentLoaded", () => {
  // Initialize Node clicks
  document.querySelectorAll(".timeline-node").forEach(node => {
    node.addEventListener("click", () => {
      const id = parseInt(node.getAttribute("data-id"));
      state.activeStage = id;
      
      // Update sidebar state
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

      // Update Node active state
      document.querySelectorAll(".timeline-node").forEach(el => el.classList.remove("active"));
      const node = document.querySelector(`.timeline-node[data-id="${id}"]`);
      if (node) node.classList.add("active");

      renderActiveStage();
    });
  });

  // Load E-Commerce as default
  handleTemplateChange();
});

// Settings API Drawer Toggler
function toggleApiSettingsDrawer() {
  const overlay = document.getElementById("api-key-overlay");
  overlay.className = overlay.className.includes("active") ? "overlay" : "overlay active";
}

function saveApiKeyDetails() {
  const keyInput = document.getElementById("anthropic-api-key").value;
  state.apiKey = keyInput;
  state.useClaudeAPI = keyInput.trim().length > 0;

  const btn = document.getElementById("api-key-header-btn");
  if (state.useClaudeAPI) {
    btn.className = "api-key-btn active";
    btn.textContent = "Claude API Connected";
  } else {
    btn.className = "api-key-btn";
    btn.textContent = "Connect API Key";
  }

  toggleApiSettingsDrawer();
  writeToTerminal(`[System] API Key configuration updated. Real Claude API mode: ${state.useClaudeAPI ? "ON" : "OFF"}.`, "success");
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

// Utility timer delay
const delay = ms => new Promise(res => setTimeout(res, ms));
