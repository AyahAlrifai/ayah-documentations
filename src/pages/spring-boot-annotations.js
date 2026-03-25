import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../css/style.module.css';

// ─── Annotation Data ────────────────────────────────────────────────────────

const ANNOTATIONS = [
  // ── Core ──
  {
    name: '@SpringBootApplication',
    category: 'Core',
    description:
      'Combines @Configuration, @EnableAutoConfiguration, and @ComponentScan. The entry-point annotation for any Spring Boot application.',
    example:
`@SpringBootApplication
public class MyApp {
  public static void main(String[] args) {
    SpringApplication.run(MyApp.class, args);
  }
}`,
  },
  {
    name: '@Component',
    category: 'Core',
    description:
      'Marks a class as a Spring-managed bean eligible for auto-detection during classpath scanning.',
    example:
`@Component
public class EmailValidator {
  public boolean isValid(String email) { ... }
}`,
  },
  {
    name: '@Service',
    category: 'Core',
    description:
      'Specialisation of @Component for the service layer, communicating business logic intent to readers and tools.',
    example:
`@Service
public class UserService {
  public User findById(Long id) { ... }
}`,
  },
  {
    name: '@Repository',
    category: 'Core',
    description:
      'Specialisation of @Component for DAO classes. Enables Spring to translate persistence exceptions into DataAccessException.',
    example:
`@Repository
public class UserRepository
    implements JpaRepository<User, Long> { }`,
  },
  {
    name: '@Configuration',
    category: 'Core',
    description:
      'Declares a class as a source of @Bean definitions, processed by the Spring container at startup.',
    example:
`@Configuration
public class AppConfig {
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}`,
  },
  {
    name: '@Bean',
    category: 'Core',
    description:
      'Signals that a method produces a bean to be managed by the Spring container. Used inside @Configuration classes.',
    example:
`@Bean
public RestTemplate restTemplate() {
  return new RestTemplate();
}`,
  },
  {
    name: '@Autowired',
    category: 'Core',
    description:
      'Injects a bean by type. Can be applied to constructors, fields, or setter methods.',
    example:
`@Service
public class OrderService {
  @Autowired
  private PaymentService paymentService;
}`,
  },
  {
    name: '@Qualifier',
    category: 'Core',
    description:
      'Disambiguates which bean to inject when multiple candidates of the same type exist in the context.',
    example:
`@Autowired
@Qualifier("smtpMailSender")
private MailSender mailSender;`,
  },
  {
    name: '@Value',
    category: 'Core',
    description:
      'Injects a value from a properties file, environment variable, or SpEL expression into a field or parameter.',
    example:
`@Value("\${app.name:MyApp}")
private String appName;

@Value("#{systemProperties['user.timezone']}")
private String timezone;`,
  },
  {
    name: '@Profile',
    category: 'Core',
    description:
      'Restricts a bean or configuration to specific active Spring profiles (e.g. dev, prod).',
    example:
`@Configuration
@Profile("dev")
public class DevDataSourceConfig {
  @Bean
  public DataSource dataSource() { ... }
}`,
  },
  {
    name: '@Lazy',
    category: 'Core',
    description:
      'Defers bean initialisation until first requested rather than at startup, useful for heavyweight or optional beans.',
    example:
`@Bean
@Lazy
public HeavyReportEngine reportEngine() {
  return new HeavyReportEngine();
}`,
  },
  {
    name: '@Primary',
    category: 'Core',
    description:
      'Marks a bean as the default candidate when multiple beans of the same type are present and no @Qualifier is specified.',
    example:
`@Bean
@Primary
public DataSource primaryDataSource() {
  return DataSourceBuilder.create().build();
}`,
  },

  // ── Web ──
  {
    name: '@RestController',
    category: 'Web',
    description:
      'Combines @Controller and @ResponseBody, making every handler method return data serialised to the response body (typically JSON).',
    example:
`@RestController
@RequestMapping("/api/users")
public class UserController {
  @GetMapping("/{id}")
  public User getUser(@PathVariable Long id) { ... }
}`,
  },
  {
    name: '@Controller',
    category: 'Web',
    description:
      'Marks a class as a Spring MVC controller. Handler methods return view names resolved by a ViewResolver.',
    example:
`@Controller
public class HomeController {
  @GetMapping("/")
  public String home(Model model) {
    model.addAttribute("title", "Home");
    return "home";
  }
}`,
  },
  {
    name: '@RequestMapping',
    category: 'Web',
    description:
      'Maps HTTP requests to handler methods or entire controller classes. Supports method, path, params, headers, and consumes/produces.',
    example:
`@RequestMapping(
  value = "/orders",
  method = RequestMethod.GET,
  produces = "application/json"
)
public List<Order> listOrders() { ... }`,
  },
  {
    name: '@GetMapping',
    category: 'Web',
    description: 'Shortcut for @RequestMapping(method = RequestMethod.GET). Maps HTTP GET requests.',
    example:
`@GetMapping("/products/{id}")
public ResponseEntity<Product> getProduct(
    @PathVariable Long id) { ... }`,
  },
  {
    name: '@PostMapping',
    category: 'Web',
    description: 'Shortcut for @RequestMapping(method = RequestMethod.POST). Maps HTTP POST requests.',
    example:
`@PostMapping("/users")
public ResponseEntity<User> createUser(
    @RequestBody @Valid CreateUserRequest req) { ... }`,
  },
  {
    name: '@PutMapping',
    category: 'Web',
    description: 'Shortcut for @RequestMapping(method = RequestMethod.PUT). Maps HTTP PUT requests.',
    example:
`@PutMapping("/users/{id}")
public User updateUser(@PathVariable Long id,
    @RequestBody UserDTO dto) { ... }`,
  },
  {
    name: '@DeleteMapping',
    category: 'Web',
    description: 'Shortcut for @RequestMapping(method = RequestMethod.DELETE). Maps HTTP DELETE requests.',
    example:
`@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(
    @PathVariable Long id) { ... }`,
  },
  {
    name: '@PathVariable',
    category: 'Web',
    description:
      'Binds a URI template variable (e.g. /users/{id}) to a method parameter.',
    example:
`@GetMapping("/orders/{orderId}/items/{itemId}")
public Item getItem(
    @PathVariable Long orderId,
    @PathVariable Long itemId) { ... }`,
  },
  {
    name: '@RequestParam',
    category: 'Web',
    description:
      'Binds a query parameter or form field from the HTTP request to a method parameter.',
    example:
`@GetMapping("/search")
public List<Product> search(
    @RequestParam String query,
    @RequestParam(defaultValue = "0") int page) { ... }`,
  },
  {
    name: '@RequestBody',
    category: 'Web',
    description:
      'Deserialises the HTTP request body (JSON, XML, etc.) into the method parameter using a registered HttpMessageConverter.',
    example:
`@PostMapping("/checkout")
public Order checkout(
    @RequestBody @Valid CartRequest cart) { ... }`,
  },
  {
    name: '@ResponseStatus',
    category: 'Web',
    description:
      'Sets the HTTP status code returned by a handler method or an exception class.',
    example:
`@ResponseStatus(HttpStatus.CREATED)
@PostMapping("/articles")
public Article create(@RequestBody ArticleDTO dto) { ... }`,
  },
  {
    name: '@ExceptionHandler',
    category: 'Web',
    description:
      'Handles exceptions thrown within a controller. Pair with @ControllerAdvice for global error handling.',
    example:
`@ControllerAdvice
public class GlobalErrorHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(
      ResourceNotFoundException ex) { ... }
}`,
  },
  {
    name: '@CrossOrigin',
    category: 'Web',
    description:
      'Enables CORS on a controller or individual handler method, specifying allowed origins, methods, and headers.',
    example:
`@CrossOrigin(origins = "https://app.example.com",
             maxAge = 3600)
@RestController
public class ApiController { ... }`,
  },

  // ── Data ──
  {
    name: '@Entity',
    category: 'Data',
    description:
      'Marks a class as a JPA entity that is mapped to a database table.',
    example:
`@Entity
@Table(name = "users")
public class User {
  @Id @GeneratedValue
  private Long id;
  private String email;
}`,
  },
  {
    name: '@Id',
    category: 'Data',
    description: 'Designates a field as the primary key of a JPA entity.',
    example:
`@Entity
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
}`,
  },
  {
    name: '@Column',
    category: 'Data',
    description:
      'Customises the mapping between an entity field and its database column (name, nullability, length, etc.).',
    example:
`@Column(name = "email_address",
        nullable = false,
        unique = true,
        length = 255)
private String email;`,
  },
  {
    name: '@Transactional',
    category: 'Data',
    description:
      'Wraps a method (or all methods in a class) in a database transaction. Supports rollback rules, propagation, and isolation levels.',
    example:
`@Service
public class TransferService {
  @Transactional(rollbackFor = Exception.class)
  public void transfer(Long from, Long to, BigDecimal amount) {
    debit(from, amount);
    credit(to, amount);
  }
}`,
  },
  {
    name: '@OneToMany',
    category: 'Data',
    description:
      'Defines a one-to-many relationship between entities, typically used with mappedBy to specify the owning side.',
    example:
`@Entity
public class Order {
  @OneToMany(mappedBy = "order",
             cascade = CascadeType.ALL,
             orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();
}`,
  },
  {
    name: '@ManyToOne',
    category: 'Data',
    description:
      'Defines a many-to-one relationship. The annotated entity holds the foreign key column.',
    example:
`@Entity
public class OrderItem {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;
}`,
  },
  {
    name: '@Query',
    category: 'Data',
    description:
      'Declares a custom JPQL or native SQL query directly on a Spring Data repository method.',
    example:
`@Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
Optional<User> findActiveByEmail(@Param("email") String email);`,
  },
  {
    name: '@EnableJpaRepositories',
    category: 'Data',
    description:
      'Enables Spring Data JPA repositories, allowing Spring to scan and create repository beans automatically.',
    example:
`@Configuration
@EnableJpaRepositories(basePackages = "com.example.repo")
public class JpaConfig { ... }`,
  },

  // ── Security ──
  {
    name: '@EnableWebSecurity',
    category: 'Security',
    description:
      'Activates Spring Security\'s web security support, triggering the creation of the SpringSecurityFilterChain.',
    example:
`@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http)
      throws Exception { ... }
}`,
  },
  {
    name: '@PreAuthorize',
    category: 'Security',
    description:
      'Evaluates a SpEL expression before entering a method and throws an AccessDeniedException if it returns false.',
    example:
`@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public User getUser(Long userId) { ... }`,
  },
  {
    name: '@PostAuthorize',
    category: 'Security',
    description:
      'Evaluates a SpEL expression after a method completes, allowing access checks against the return value.',
    example:
`@PostAuthorize("returnObject.owner == authentication.name")
public Document getDocument(Long id) { ... }`,
  },
  {
    name: '@Secured',
    category: 'Security',
    description:
      'Restricts access to a method based on one or more role strings. A simpler alternative to @PreAuthorize.',
    example:
`@Secured({"ROLE_ADMIN", "ROLE_SUPERUSER"})
public void deleteUser(Long userId) { ... }`,
  },
  {
    name: '@EnableMethodSecurity',
    category: 'Security',
    description:
      'Enables Spring Security method-level annotations (@PreAuthorize, @PostAuthorize, @Secured) on a configuration class.',
    example:
`@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig { }`,
  },

  // ── AOP ──
  {
    name: '@Aspect',
    category: 'AOP',
    description:
      'Marks a class as an AOP aspect containing advice (before, after, around) and pointcut declarations.',
    example:
`@Aspect
@Component
public class LoggingAspect {
  @Before("execution(* com.example.service.*.*(..))")
  public void logBefore(JoinPoint jp) {
    log.info("Calling: {}", jp.getSignature());
  }
}`,
  },
  {
    name: '@Around',
    category: 'AOP',
    description:
      'Wraps the target method, allowing code to run before and after the join point and the ability to alter return values.',
    example:
`@Around("@annotation(com.example.Timed)")
public Object measureTime(ProceedingJoinPoint pjp) throws Throwable {
  long start = System.currentTimeMillis();
  Object result = pjp.proceed();
  log.info("Elapsed: {}ms", System.currentTimeMillis() - start);
  return result;
}`,
  },
  {
    name: '@Before',
    category: 'AOP',
    description:
      'Runs advice before the matched join point executes. Cannot prevent the target method from proceeding.',
    example:
`@Before("@annotation(RequiresAudit)")
public void auditEntry(JoinPoint jp) {
  auditLog.record(jp.getSignature().getName());
}`,
  },
  {
    name: '@After',
    category: 'AOP',
    description:
      'Runs advice after the matched join point has finished (regardless of success or exception).',
    example:
`@After("execution(* com.example.repo.*.*(..))")
public void afterRepoCall(JoinPoint jp) {
  metricsRegistry.increment("db.calls");
}`,
  },
  {
    name: '@EnableAspectJAutoProxy',
    category: 'AOP',
    description:
      'Enables support for handling @Aspect beans using AspectJ\'s auto-proxying mechanism.',
    example:
`@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig { }`,
  },

  // ── Scheduling ──
  {
    name: '@EnableScheduling',
    category: 'Scheduling',
    description:
      'Activates Spring\'s scheduled task execution capability, enabling @Scheduled annotations to be processed.',
    example:
`@SpringBootApplication
@EnableScheduling
public class MyApp {
  public static void main(String[] args) {
    SpringApplication.run(MyApp.class, args);
  }
}`,
  },
  {
    name: '@Scheduled',
    category: 'Scheduling',
    description:
      'Marks a method to be executed on a fixed-rate, fixed-delay, or cron expression schedule.',
    example:
`@Scheduled(cron = "0 0 2 * * MON-FRI")
public void generateNightlyReport() {
  reportService.generate();
}

@Scheduled(fixedDelay = 5000)
public void pollExternalApi() { ... }`,
  },
  {
    name: '@Async',
    category: 'Scheduling',
    description:
      'Runs a method in a separate thread (from a task executor pool) instead of the caller\'s thread. Requires @EnableAsync.',
    example:
`@Async
public CompletableFuture<Report> buildReport(Long id) {
  // runs on a thread-pool thread
  return CompletableFuture.completedFuture(doWork(id));
}`,
  },
  {
    name: '@EnableAsync',
    category: 'Scheduling',
    description:
      'Enables Spring\'s asynchronous method execution support so that @Async annotations are honoured.',
    example:
`@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
  @Override
  public Executor getAsyncExecutor() {
    ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
    exec.setCorePoolSize(4);
    exec.initialize();
    return exec;
  }
}`,
  },

  // ── Testing ──
  {
    name: '@SpringBootTest',
    category: 'Testing',
    description:
      'Bootstraps the full Spring application context for integration tests. Supports webEnvironment settings.',
    example:
`@SpringBootTest(webEnvironment =
    SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderApiIT {
  @Autowired TestRestTemplate rest;

  @Test
  void createOrder_returns201() { ... }
}`,
  },
  {
    name: '@WebMvcTest',
    category: 'Testing',
    description:
      'Creates a slice test context containing only Spring MVC components. Fast alternative to @SpringBootTest for controller tests.',
    example:
`@WebMvcTest(UserController.class)
class UserControllerTest {
  @Autowired MockMvc mvc;
  @MockBean UserService userService;

  @Test
  void getUser_returns200() throws Exception {
    mvc.perform(get("/api/users/1"))
       .andExpect(status().isOk());
  }
}`,
  },
  {
    name: '@DataJpaTest',
    category: 'Testing',
    description:
      'Configures an in-memory database and JPA-specific components for testing repositories without loading the full context.',
    example:
`@DataJpaTest
class UserRepositoryTest {
  @Autowired UserRepository repo;

  @Test
  void findByEmail_returnsUser() {
    repo.save(new User("bob@example.com"));
    assertThat(repo.findByEmail("bob@example.com")).isPresent();
  }
}`,
  },
  {
    name: '@MockBean',
    category: 'Testing',
    description:
      'Adds a Mockito mock into the Spring application context, replacing any existing bean of the same type.',
    example:
`@WebMvcTest(CheckoutController.class)
class CheckoutControllerTest {
  @MockBean PaymentService paymentService;

  @Test
  void checkout_callsPayment() { ... }
}`,
  },
  {
    name: '@TestPropertySource',
    category: 'Testing',
    description:
      'Overrides application properties for a specific test class, useful for pointing at test-specific config files.',
    example:
`@SpringBootTest
@TestPropertySource(properties = {
  "spring.datasource.url=jdbc:h2:mem:testdb",
  "feature.flag.new-ui=true"
})
class FeatureFlagTest { ... }`,
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ['All', 'Core', 'Web', 'Data', 'Security', 'AOP', 'Scheduling', 'Testing'];

const CATEGORY_COLORS = {
  Core:       { bg: 'rgba(82, 141, 255, 0.12)',  text: '#528dff',  border: 'rgba(82, 141, 255, 0.28)'  },
  Web:        { bg: 'rgba(34, 197, 94, 0.12)',   text: '#16a34a',  border: 'rgba(34, 197, 94, 0.28)'   },
  Data:       { bg: 'rgba(251, 191, 36, 0.12)',  text: '#d97706',  border: 'rgba(251, 191, 36, 0.28)'  },
  Security:   { bg: 'rgba(239, 68, 68, 0.12)',   text: '#dc2626',  border: 'rgba(239, 68, 68, 0.28)'   },
  AOP:        { bg: 'rgba(168, 85, 247, 0.12)',  text: '#7c3aed',  border: 'rgba(168, 85, 247, 0.28)'  },
  Scheduling: { bg: 'rgba(20, 184, 166, 0.12)',  text: '#0d9488',  border: 'rgba(20, 184, 166, 0.28)'  },
  Testing:    { bg: 'rgba(236, 72, 153, 0.12)',  text: '#be185d',  border: 'rgba(236, 72, 153, 0.28)'  },
};

const CATEGORY_COLORS_DARK = {
  Core:       { bg: 'rgba(82, 141, 255, 0.14)',  text: '#93b4ff',  border: 'rgba(82, 141, 255, 0.3)'   },
  Web:        { bg: 'rgba(74, 222, 128, 0.12)',  text: '#4ade80',  border: 'rgba(74, 222, 128, 0.28)'  },
  Data:       { bg: 'rgba(251, 191, 36, 0.12)',  text: '#fbbf24',  border: 'rgba(251, 191, 36, 0.28)'  },
  Security:   { bg: 'rgba(248, 113, 113, 0.12)', text: '#f87171',  border: 'rgba(248, 113, 113, 0.28)' },
  AOP:        { bg: 'rgba(192, 132, 252, 0.12)', text: '#c084fc',  border: 'rgba(192, 132, 252, 0.28)' },
  Scheduling: { bg: 'rgba(45, 212, 191, 0.12)',  text: '#2dd4bf',  border: 'rgba(45, 212, 191, 0.28)'  },
  Testing:    { bg: 'rgba(244, 114, 182, 0.12)', text: '#f472b6',  border: 'rgba(244, 114, 182, 0.28)' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryTag({ category, isDark }) {
  const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const c = palette[category] || { bg: '#eee', text: '#333', border: '#ccc' };
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        padding: '0.22rem 0.65rem',
        borderRadius: '50px',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {category}
    </span>
  );
}

function AnnotationCard({ annotation, isDark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(annotation.example).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const cardBg     = isDark ? '#161b22' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const cardShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)';

  const nameBg     = isDark ? 'rgba(82,141,255,0.13)' : 'rgba(8,89,252,0.07)';
  const nameColor  = isDark ? '#93b4ff' : '#0859fc';
  const nameBorder = isDark ? 'rgba(82,141,255,0.25)' : 'rgba(8,89,252,0.18)';

  const descColor  = isDark ? 'rgba(255,255,255,0.62)' : '#4b5563';

  const preBg      = isDark ? '#0d1117' : '#f6f8fa';
  const preBorder  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const preColor   = isDark ? '#c9d1d9' : '#1f2937';

  const copyColor  = isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af';
  const copyHover  = isDark ? 'rgba(255,255,255,0.7)'  : '#374151';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '1.35rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: cardShadow,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 16px 40px rgba(0,0,0,0.45)'
          : '0 16px 40px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(82,141,255,0.3)'
          : 'rgba(8,89,252,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = cardShadow;
        e.currentTarget.style.borderColor = cardBorder;
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: '0.95rem',
            fontWeight: 700,
            padding: '0.28rem 0.72rem',
            borderRadius: '8px',
            background: nameBg,
            color: nameColor,
            border: `1px solid ${nameBorder}`,
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}
        >
          {annotation.name}
        </span>
        <CategoryTag category={annotation.category} isDark={isDark} />
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: descColor,
        }}
      >
        {annotation.description}
      </p>

      {/* Code block */}
      <div style={{ position: 'relative' }}>
        <pre
          style={{
            margin: 0,
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: preBg,
            border: `1px solid ${preBorder}`,
            color: preColor,
            fontFamily: "'Consolas', 'Courier New', monospace",
            fontSize: '0.78rem',
            lineHeight: 1.65,
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}
        >
          {annotation.example}
        </pre>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy example"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: copied ? '#4ade80' : copyColor,
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '0.2rem 0.45rem',
            borderRadius: '5px',
            transition: 'color 0.2s ease',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = copyHover; }}
          onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = copyColor; }}
        >
          {copied ? '✓ copied' : '⎘ copy'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function SpringBootAnnotationsContent() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ANNOTATIONS.filter((a) => {
      const catMatch = activeCategory === 'All' || a.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.example.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  // ── Design tokens ──
  const pageBg     = isDark ? '#0d1117'  : '#f0f4fb';
  const toolbarBg  = isDark ? '#161b22'  : '#ffffff';
  const toolbarBor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const titleColor = isDark ? 'rgba(255,255,255,0.88)' : '#1f2937';

  const inputBg    = isDark ? 'rgba(255,255,255,0.05)' : '#f4f7ff';
  const inputBor   = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inputColor = isDark ? 'rgba(255,255,255,0.82)' : '#1f2937';
  const inputPlaceholder = isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af';

  const tabActiveBg  = 'linear-gradient(135deg, #528dff 0%, #0859fc 100%)';
  const tabInactiveBg = isDark ? 'rgba(255,255,255,0.05)' : '#f4f7ff';
  const tabInactiveColor = isDark ? 'rgba(255,255,255,0.55)' : '#6b7280';
  const tabInactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const emptyColor = isDark ? 'rgba(255,255,255,0.28)' : '#9ca3af';
  const countColor = isDark ? 'rgba(255,255,255,0.38)' : '#9ca3af';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        background: pageBg,
        padding: '1.5rem 1.75rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* ── Toolbar ── */}
      <div
        className={styles.toolBar}
        style={{
          background: toolbarBg,
          border: `1px solid ${toolbarBor}`,
          flexWrap: 'wrap',
          rowGap: '0.6rem',
        }}
      >
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginRight: 'auto' }}>
          <span style={{ fontSize: '1.15rem' }}>☕</span>
          <span className={styles.toolBarTitle} style={{ color: titleColor, fontSize: '1rem' }}>
            Spring Boot Annotations
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.18rem 0.55rem',
              borderRadius: '50px',
              background: isDark ? 'rgba(82,141,255,0.14)' : 'rgba(8,89,252,0.08)',
              color: isDark ? '#93b4ff' : '#0859fc',
              border: isDark ? '1px solid rgba(82,141,255,0.25)' : '1px solid rgba(8,89,252,0.18)',
              letterSpacing: '0.05em',
            }}
          >
            {ANNOTATIONS.length} annotations
          </span>
        </div>

        <div className={styles.toolBarDivider} />

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
              fontSize: '0.9rem',
              pointerEvents: 'none',
              lineHeight: 1,
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search annotations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '0.42rem 0.85rem 0.42rem 2rem',
              borderRadius: '8px',
              border: `1px solid ${inputBor}`,
              background: inputBg,
              color: inputColor,
              fontSize: '0.875rem',
              outline: 'none',
              width: '220px',
              transition: 'border-color 0.2s ease',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#528dff'; }}
            onBlur={(e) => { e.target.style.borderColor = inputBor; }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af',
                fontSize: '0.85rem',
                lineHeight: 1,
                padding: '0.15rem',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.toolBarDivider} />

        {/* Result count */}
        <span className={styles.toolBarMeta} style={{ color: countColor }}>
          {filtered.length} / {ANNOTATIONS.length} shown
        </span>
      </div>

      {/* ── Category Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const palette = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
          const cp = palette[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.38rem 1.05rem',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                border: `1px solid ${isActive ? 'transparent' : (cp ? cp.border : tabInactiveBorder)}`,
                background: isActive
                  ? (cp ? cp.bg : tabActiveBg)
                  : tabInactiveBg,
                color: isActive
                  ? (cp ? cp.text : '#fff')
                  : tabInactiveColor,
                boxShadow: isActive && !cp ? '0 2px 10px rgba(82,141,255,0.3)' : 'none',
                transition: 'all 0.18s ease',
                lineHeight: 1.4,
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = cp ? cp.border : 'rgba(82,141,255,0.35)';
                  e.currentTarget.style.color = cp ? cp.text : (isDark ? 'rgba(255,255,255,0.88)' : '#374151');
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = cp ? cp.border : tabInactiveBorder;
                  e.currentTarget.style.color = tabInactiveColor;
                }
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span
                  style={{
                    marginLeft: '0.35rem',
                    fontSize: '0.72rem',
                    opacity: 0.75,
                  }}
                >
                  {ANNOTATIONS.filter((a) => a.category === cat).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 2rem',
            gap: '0.85rem',
            color: emptyColor,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2.8rem', opacity: 0.45 }}>🔍</span>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            No annotations match "{query}"
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
            Try a different search term or clear the filter.
          </p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('All'); }}
            style={{
              marginTop: '0.5rem',
              padding: '0.45rem 1.2rem',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.6)' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.1rem',
          }}
        >
          {filtered.map((annotation) => (
            <AnnotationCard
              key={annotation.name}
              annotation={annotation}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: isDark ? 'rgba(255,255,255,0.22)' : '#c4c9d4',
          paddingTop: '1rem',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          marginTop: '1rem',
        }}
      >
        Spring Boot Annotations Cheat Sheet · {ANNOTATIONS.length} annotations across {ALL_CATEGORIES.length - 1} categories
      </div>
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────

export default function SpringBootAnnotations() {
  return (
    <Layout
      title="Spring Boot Annotations Cheat Sheet"
      description="A searchable, categorized reference of Spring Boot annotations with usage examples — Core, Web, Data, Security, AOP, Scheduling, and Testing."
    >
      <SpringBootAnnotationsContent />
    </Layout>
  );
}
