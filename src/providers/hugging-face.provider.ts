export interface EmbeddingsProviderConfig {
  model: string;
}

export interface EmbeddingsProvider {
  readonly model: string;
  embed(text: string): Promise<number[]>;
}

import {
  FeatureExtractionPipeline,
  pipeline,
  PretrainedModelOptions,
} from "@huggingface/transformers";

// Simple in-memory cache to avoid repeated model loading & duplicate embeddings
const modelPipelines: Record<string, any> = {};

export interface HuggingFaceEmbeddingsConfig extends EmbeddingsProviderConfig {
  rewriteQuery?: (query: string) => Promise<string>; // For cases like e5 where "query: " should be prefixed
  options?: PretrainedModelOptions; // Additional options for the model pipeline
}

export class HuggingFaceEmbeddings implements EmbeddingsProvider {
  public readonly model: string;
  private embedder?: FeatureExtractionPipeline;
  private options?: PretrainedModelOptions;
  private rewriteQuery?: (query: string) => Promise<string>;
  private initPromise?: Promise<void>;

  constructor(cfg: HuggingFaceEmbeddingsConfig) {
    this.model = cfg.model;
    this.options = cfg.options;
    this.rewriteQuery = cfg.rewriteQuery;
  }

  private async ensurePipeline() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        if (!modelPipelines[this.model]) {
          modelPipelines[this.model] = await pipeline(
            "feature-extraction",
            this.model,
            this.options
          );
        }
        this.embedder = modelPipelines[this.model];
      })();
    }
    await this.initPromise;
  }

  async embed(text: string): Promise<number[]> {
    await this.ensurePipeline();
    if (!this.embedder) throw new Error("Embedding pipeline not initialised");

    const processedText = this.rewriteQuery
      ? await this.rewriteQuery(text)
      : text;

    const vector = await this.embedder(processedText, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(vector.data);
  }
}

export default HuggingFaceEmbeddings;
