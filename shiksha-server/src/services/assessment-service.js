import { StatusCodes } from "http-status-codes";
import AppError from "../utils/errors/app-error.js";
import {
    AssessmentRepository,
    AssessmentResultRepository,
} from "../repository/index.js";
import Institute from "../models/Institute.js";

const DIMENSIONS = [
    "Analytical",
    "Creative",
    "Social",
    "Leadership",
    "Practical",
    "Conventional",
];

// Maps institute stream / specialization / facility keywords to a personality dimension.
const STREAM_DIMENSION_MAP = {
    Analytical: [
        "engineering",
        "technology",
        "computer",
        "science",
        "mathematics",
        "physics",
        "chemistry",
        "it",
        "software",
        "data",
        "electronics",
        "mechanical",
        "civil",
    ],
    Creative: [
        "design",
        "fine arts",
        "architecture",
        "media",
        "fashion",
        "animation",
        "film",
        "music",
        "photography",
        "interior",
        "multimedia",
        "journalism",
    ],
    Social: [
        "education",
        "teaching",
        "nursing",
        "social work",
        "psychology",
        "hotel",
        "hospitality",
        "communication",
        "physiotherapy",
        "arts",
        "social",
    ],
    Leadership: [
        "management",
        "commerce",
        "business",
        "mba",
        "bba",
        "entrepreneurship",
        "administration",
        "marketing",
    ],
    Practical: [
        "pharmacy",
        "agriculture",
        "medical",
        "polytechnic",
        "vocational",
        "iti",
        "paramedical",
        "dairy",
        "horticulture",
        "nursing",
    ],
    Conventional: [
        "law",
        "accounting",
        "finance",
        "ca",
        "cs",
        "company secretary",
        "taxation",
        "banking",
        "audit",
    ],
};

// Default personality-to-college-fit assessment. Each option boosts one dimension.
const DEFAULT_ASSESSMENT = {
    title: "Personality-to-College Fit Assessment",
    description:
        "A short psychometric assessment that maps your personality to the colleges and campus cultures that suit you best.",
    questions: [
        {
            questionText:
                "When faced with a tough problem, what do you enjoy most?",
            category: "Approach",
            options: [
                { text: "Breaking it down with logic and data", dimension: "Analytical" },
                { text: "Imagining a brand-new creative solution", dimension: "Creative" },
                { text: "Discussing it with others to find a way forward", dimension: "Social" },
                { text: "Organising a plan and leading the fix", dimension: "Leadership" },
            ],
        },
        {
            questionText: "Which project would you pick in college?",
            category: "Interest",
            options: [
                { text: "Building an app or running a lab experiment", dimension: "Analytical" },
                { text: "Designing a poster, film or product", dimension: "Creative" },
                { text: "Running a community outreach or teaching drive", dimension: "Social" },
                { text: "Starting a student club or business idea", dimension: "Leadership" },
            ],
        },
        {
            questionText: "How do you prefer to learn?",
            category: "Learning",
            options: [
                { text: "Hands-on labs and real equipment", dimension: "Practical" },
                { text: "Clear rules, notes and structured study", dimension: "Conventional" },
                { text: "Group discussions and debates", dimension: "Social" },
                { text: "Open-ended, explore-my-own-way tasks", dimension: "Creative" },
            ],
        },
        {
            questionText: "Your ideal weekend looks like…",
            category: "Lifestyle",
            options: [
                { text: "A hackathon or a science museum", dimension: "Analytical" },
                { text: "A art exhibit, concert or workshop", dimension: "Creative" },
                { text: "Volunteering or hanging out with a big group", dimension: "Social" },
                { text: "Planning an event or side hustle", dimension: "Leadership" },
            ],
        },
        {
            questionText: "What kind of campus culture attracts you?",
            category: "Culture",
            options: [
                { text: "Research-focused and technically strong", dimension: "Analytical" },
                { text: "Expressive, artistic and diverse", dimension: "Creative" },
                { text: "Warm, friendly and community-driven", dimension: "Social" },
                { text: "Ambitious, competitive and network-rich", dimension: "Leadership" },
            ],
        },
        {
            questionText: "Pick a subject you'd enjoy studying:",
            category: "Subject",
            options: [
                { text: "Mathematics or Computer Science", dimension: "Analytical" },
                { text: "Fine Arts or Architecture", dimension: "Creative" },
                { text: "Psychology or Social Work", dimension: "Social" },
                { text: "Commerce or Business Administration", dimension: "Leadership" },
            ],
        },
        {
            questionText: "At work you are best at…",
            category: "Strength",
            options: [
                { text: "Following processes accurately and reliably", dimension: "Conventional" },
                { text: "Fixing things with my hands", dimension: "Practical" },
                { text: "Coming up with fresh ideas", dimension: "Creative" },
                { text: "Motivating and guiding a team", dimension: "Leadership" },
            ],
        },
        {
            questionText: "Which statement feels most like you?",
            category: "Self",
            options: [
                { text: "I like clear rules and organised routines", dimension: "Conventional" },
                { text: "I learn best by doing, not just reading", dimension: "Practical" },
                { text: "I'm curious about how things work", dimension: "Analytical" },
                { text: "I care a lot about people and relationships", dimension: "Social" },
            ],
        },
        {
            questionText: "You'd feel most successful as a…",
            category: "Goal",
            options: [
                { text: "Scientist, engineer or analyst", dimension: "Analytical" },
                { text: "Designer, writer or artist", dimension: "Creative" },
                { text: "Teacher, counsellor or healthcare worker", dimension: "Social" },
                { text: "Manager, founder or lawyer", dimension: "Conventional" },
            ],
        },
        {
            questionText: "In a team, your usual role is…",
            category: "Team",
            options: [
                { text: "The one who keeps records and details straight", dimension: "Conventional" },
                { text: "The one who builds the prototype", dimension: "Practical" },
                { text: "The one who bridges and supports everyone", dimension: "Social" },
                { text: "The one who sets the vision", dimension: "Creative" },
            ],
        },
        {
            questionText: "What motivates you most?",
            category: "Drive",
            options: [
                { text: "Solving hard technical challenges", dimension: "Analytical" },
                { text: "Making something beautiful or original", dimension: "Creative" },
                { text: "Helping others grow", dimension: "Social" },
                { text: "Earning responsibility and influence", dimension: "Leadership" },
            ],
        },
        {
            questionText: "Choose an internship:",
            category: "Exposure",
            options: [
                { text: "R&D lab or software company", dimension: "Analytical" },
                { text: "Studio, agency or NGO", dimension: "Creative" },
                { text: "Hospital, school or social enterprise", dimension: "Social" },
                { text: "Bank, firm or startup", dimension: "Conventional" },
            ],
        },
    ],
};

class AssessmentService {
    constructor() {
        this.assessmentRepository = new AssessmentRepository();
        this.resultRepository = new AssessmentResultRepository();
    }

    // ── CRUD ──────────────────────────────────────
    async create(data) {
        try {
            if (!data.questions || data.questions.length === 0) {
                throw new AppError(
                    "Assessment must have at least one question",
                    StatusCodes.BAD_REQUEST
                );
            }
            return await this.assessmentRepository.create(data);
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot create assessment",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAll() {
        try {
            return await this.assessmentRepository.getActive();
        } catch (error) {
            throw new AppError(
                "Cannot fetch assessments",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getById(id) {
        try {
            const assessment = await this.assessmentRepository.get(id);
            if (!assessment || assessment.deletedAt) {
                throw new AppError(
                    "Assessment not found",
                    StatusCodes.NOT_FOUND
                );
            }
            return assessment;
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot fetch assessment",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async delete(id) {
        try {
            const response = await this.assessmentRepository.destroy(id);
            if (!response) {
                throw new AppError(
                    "Assessment not found",
                    StatusCodes.NOT_FOUND
                );
            }
            return response;
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot delete assessment",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ── Seed default assessment if none exists ──
    async ensureDefaultAssessment() {
        try {
            const existing = await this.assessmentRepository.getActive();
            if (existing && existing.length > 0) return existing[0];
            return await this.assessmentRepository.create(DEFAULT_ASSESSMENT);
        } catch (error) {
            throw error;
        }
    }

    // ── Scoring helpers ───────────────────────────
    computeProfile(assessment, answers) {
        const profile = {};
        DIMENSIONS.forEach((d) => (profile[d] = 0));

        const questionMap = new Map();
        (assessment.questions || []).forEach((q) => {
            questionMap.set(String(q._id), q);
        });

        const validated = [];
        answers.forEach((ans) => {
            const q = questionMap.get(String(ans.questionId));
            if (!q) return;
            const idx = ans.selectedOptionIndex;
            if (idx < 0 || idx >= q.options.length) return;
            const option = q.options[idx];
            profile[option.dimension] += option.score || 1;
            validated.push({
                questionId: ans.questionId,
                selectedOptionIndex: idx,
                dimension: option.dimension,
            });
        });

        const total = DIMENSIONS.reduce((s, d) => s + profile[d], 0) || 1;
        const normalized = {};
        DIMENSIONS.forEach((d) => {
            normalized[d] = Math.round((profile[d] / total) * 100);
        });

        const dominant = DIMENSIONS.filter((d) => profile[d] > 0).sort(
            (a, b) => profile[b] - profile[a]
        );

        return {
            raw: profile,
            normalized,
            answers: validated,
            dominantDimensions: dominant,
        };
    }

    buildInstituteVector(institute) {
        const vector = {};
        DIMENSIONS.forEach((d) => (vector[d] = 0));

        // Discrete, structured fields only (avoid noisy free-text "about").
        const textPieces = [
            ...(institute.streams || []),
            ...(institute.specialization || []),
            ...(institute.facilities || []),
            institute.organizationType || "",
        ]
            .join(" ")
            .toLowerCase();

        for (const [dimension, keywords] of Object.entries(
            STREAM_DIMENSION_MAP
        )) {
            for (const kw of keywords) {
                if (textPieces.includes(kw)) vector[dimension] += 1;
            }
        }
        return vector;
    }

    // Personality-to-college fit: a student cares most about their dominant
    // dimensions, so we weight each institute's coverage by the student's
    // normalized personality weights. Presence in a dimension = 1, absence = 0.
    computeFitScore(profile, vector) {
        let weighted = 0;
        let totalWeight = 0;
        DIMENSIONS.forEach((d) => {
            const w = profile[d] || 0;
            const coverage = vector[d] > 0 ? 1 : 0;
            weighted += w * coverage;
            totalWeight += w;
        });
        if (totalWeight === 0) return 0;
        return Math.round((weighted / totalWeight) * 100);
    }

    async computeRecommendations(profile) {
        const institutes = await Institute.find({
            status: true,
            deletedAt: null,
        })
            .select(
                "instituteName city state streams specialization facilities minFees maxFees ranking organizationType"
            )
            .limit(200)
            .lean();

        const fitted = institutes.map((inst) => {
            const vector = this.buildInstituteVector(inst);
            const score = this.computeFitScore(profile.normalized, vector);
            const matched = DIMENSIONS.filter(
                (d) => vector[d] > 0 && profile.normalized[d] > 0
            );
            return {
                instituteId: inst._id,
                instituteName: inst.instituteName,
                city: inst.city?.name || "",
                state: inst.state?.name || "",
                fitScore: score,
                matchedDimensions: matched,
                minFees: inst.minFees || null,
                maxFees: inst.maxFees || null,
                ranking: inst.ranking || null,
            };
        });

        // Rank by fit score, then by number of matched dimensions as tie-breaker.
        fitted.sort((a, b) => {
            if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
            return b.matchedDimensions.length - a.matchedDimensions.length;
        });
        return fitted.slice(0, 10);
    }

    // ── Submit answers, compute, persist ──────────
    async submit({ assessmentId, userId = null, answers }) {
        try {
            if (!assessmentId) {
                throw new AppError(
                    "assessmentId is required",
                    StatusCodes.BAD_REQUEST
                );
            }
            if (!Array.isArray(answers) || answers.length === 0) {
                throw new AppError(
                    "answers are required",
                    StatusCodes.BAD_REQUEST
                );
            }

            const assessment = await this.getById(assessmentId);
            const { raw, normalized, answers: validated, dominantDimensions } =
                this.computeProfile(assessment, answers);

            const topInstitutes = await this.computeRecommendations({
                normalized,
            });

            const result = await this.resultRepository.create({
                userId,
                assessmentId,
                answers: validated,
                profile: normalized,
                dominantDimensions,
                topInstitutes,
            });

            return result;
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot submit assessment",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getResult(resultId) {
        try {
            const result = await this.resultRepository.get(resultId);
            if (!result || result.deletedAt) {
                throw new AppError(
                    "Result not found",
                    StatusCodes.NOT_FOUND
                );
            }
            return result;
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot fetch result",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getResultsByUser(userId) {
        try {
            if (!userId) {
                throw new AppError(
                    "userId is required",
                    StatusCodes.BAD_REQUEST
                );
            }
            return await this.resultRepository.getByUser(userId);
        } catch (error) {
            if (error.statusCode) throw error;
            throw new AppError(
                "Cannot fetch results",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export default AssessmentService;
