import mongoose from 'mongoose';

const searchResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  results: [
    {
      title: String,
      url: String,
      description: String,
      source: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  summary: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('SearchResult', searchResultSchema);
