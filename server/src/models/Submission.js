const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0 },
    maxScore: { type: Number, min: 1 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    files: [fileSchema],
    text: { type: String },
    submittedAt: { type: Date, default: Date.now },
    grade: gradeSchema,
    feedback: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
