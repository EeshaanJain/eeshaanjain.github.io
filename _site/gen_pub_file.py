#!/usr/bin/env python3
"""
Publication Manager - Automatically generate publication HTML from structured data
"""

class Publication:
    def __init__(self, title, authors, venue, abstract, paper_url, 
                 image_path, bibtex, code_url=None, arxiv_url=None, 
                 author_to_bold="Eeshaan Jain"):
        self.title = title
        self.authors = self._bold_author(authors, author_to_bold)
        self.venue = venue
        self.abstract = abstract
        self.paper_url = paper_url
        self.image_path = image_path
        self.bibtex = bibtex
        self.code_url = code_url
        self.arxiv_url = arxiv_url
    
    def _bold_author(self, authors, target_author):
        """Automatically bold the target author name"""
        return authors.replace(target_author, f"<b>{target_author}</b>")
    
    def to_html(self):
        """Generate HTML for this publication"""
        # Build links row
        links = [f'<td><a href="{self.paper_url}">Paper</a></td>']
        if self.code_url:
            links.append(f'<td><a href="{self.code_url}">Code</a></td>')
        if self.arxiv_url:
            links.append(f'<td><a href="{self.arxiv_url}">Arxiv</a></td>')
        
        html = f'''<div class="publication">
  <div class="row">
    <div class="six columns">
      <img style="margin-top:0em" src="{self.image_path}">
      <table>
        <tr>          
          {''.join(links)}
        </tr>
      </table>
    </div>

    <div class="six columns">
      <b>{self.title}</b> 
      <p>{self.authors}<br />{self.venue}</p>
      <p>{self.abstract}</p>
      
      <a href="#" class="bib-toggle" style="
    display: inline-block;
    margin-top: 1em;
    color: #000;
    text-decoration: none;
    font-size: 1em;
    cursor: pointer;
  ">
    <span class="toggle-icon">▶</span> <span class="toggle-text">Show BibTeX</span>
    </a>
    
    <div class="bib-block" style="
          display: none;
          margin-top: 1em;
          width: 100%;
          height: 100%;
          overflow: auto;
          border: 1px solid #ccc;
          padding: 10px;
          background-color: #f9f9f9;
          box-sizing: border-box;
        ">
      <pre style="margin: 0; font-family: monospace;">
{self.bibtex}
        </pre>
      </div>
    </div>
  </div>
</div>'''
        return html


def generate_publications_html(publications, output_file="research.html"):
    """Generate complete HTML file from list of publications"""
    
    header = '''---
layout: layout
title: "Research Overview"
---

<h2 id='publications' class="page-heading">Publications</h2>

<div class="divider"></div>
'''
    
    footer = '''
<script>
  // Attach click event listeners to all elements with the "bib-toggle" class
  document.querySelectorAll('.bib-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Find the closest publication container, then the bib-block inside it
      var publication = toggle.closest('.publication');
      var bibBlock = publication.querySelector('.bib-block');
      var icon = toggle.querySelector('.toggle-icon');
      var text = toggle.querySelector('.toggle-text');

      // Toggle display and update icon/text
      if (bibBlock.style.display === "none" || bibBlock.style.display === "") {
        bibBlock.style.display = "block";
        icon.textContent = "▼";
        text.textContent = "Hide BibTeX";
      } else {
        bibBlock.style.display = "none";
        icon.textContent = "▶";
        text.textContent = "Show BibTeX";
      }
    });
  });
</script>'''
    
    # Generate HTML for all publications
    pub_htmls = []
    for pub in publications:
        pub_htmls.append(pub.to_html())
    
    # Join with dividers
    content = '\n\n<div class="divider"></div>\n\n'.join(pub_htmls)
    
    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header)
        f.write(content)
        f.write('\n\n')
        f.write(footer)
    
    print(f"✓ Generated {output_file} with {len(publications)} publications")


# ============================================================================
# ADD YOUR PUBLICATIONS HERE
# ============================================================================

publications = [
    Publication(
        title="MTBBench: A Multimodal Sequential Clinical Decision-Making Benchmark in Oncology",
        authors="Eeshaan Jain, Johann Wenckstern, Benedikt von Querfurth, Charlotte Bunne",
        venue="The Thirty-eighth Annual Conference on Neural Information Processing Systems (NeurIPS 2025)",
        abstract="Multimodal Large Language Models (LLMs) hold promise for biomedical reasoning, but current benchmarks fail to capture the complexity of real-world clinical workflows. Existing evaluations primarily assess unimodal, decontextualized question-answering, overlooking multi-agent decision-making environments such as Molecular Tumor Boards (MTBs). MTBs bring together diverse experts in oncology, where diagnostic and prognostic tasks require integrating heterogeneous data and evolving insights over time. Current benchmarks lack this longitudinal and multimodal complexity. We introduce MTBBench, an agentic benchmark simulating MTB-style decision-making through clinically challenging, multimodal, and longitudinal oncology questions. Ground truth annotations are validated by clinicians via a co-developed app, ensuring clinical relevance. We benchmark multiple open and closed-source LLMs and show that, even at scale, they lack reliability---frequently hallucinating, struggling with reasoning from time-resolved data, and failing to reconcile conflicting evidence or different modalities. To address these limitations, MTBBench goes beyond benchmarking by providing an agentic framework with foundation model-based tools that enhance multi-modal and longitudinal reasoning, leading to task-level performance gains of up to 9.0% and 11.2%, respectively.     Overall, MTBBench offers a challenging and realistic testbed for advancing multimodal LLM reasoning, reliability, and tool-use with a focus on MTB environments in precision oncology.",
        paper_url="https://openreview.net/forum?id=anzoPBV4jI",
        code_url="https://github.com/cronosbenchmark/cronos",
        image_path="/images/MTBBench.pdf",
        bibtex=None,
#         bibtex='''@article{jain2025mavis,
#   title={Test-Time View Selection for Multi-Modal Decision Making},
#   author={Jain, Eeshaan and Wenckstern, Johann and von Querfurth, Benedikt and Bunne, Charlotte},
#   journal={ICLR 2025 Workshop},
#   year={2025}
# }'''
    ),

    Publication(
        title="Test-Time View Selection for Multi-Modal Decision Making",
        authors="Eeshaan Jain, Johann Wenckstern, Benedikt von Querfurth, Charlotte Bunne",
        venue="Oral (Top 4%) @ MLGenX Workshop & Poster @ GemBio Workshop, ICLR 2025",
        abstract="The clinical routine has access to an ever-expanding repertoire of diagnostic tests, ranging from routine imaging to sophisticated molecular profiling technologies. Foundation models have recently emerged as powerful tools for extracting and integrating diagnostic information from these diverse clinical tests, advancing the idea of comprehensive patient digital twins. However, it remains unclear how to select and design tests that ensure foundation models can extract the necessary information for accurate diagnosis. We introduce MAVIS (Multi-modal Active VIew Selection), a reinforcement learning framework that unifies modality selection and feature selection into a single decision process. By leveraging foundation models, MAVIS dynamically determines which diagnostic tests to perform and in what sequence, adapting to individual patient characteristics. Experiments on real-world datasets across multiple clinical tasks demonstrate that MAVIS outperforms conventional approaches in both diagnostic accuracy and uncertainty reduction, while reducing testing costs by over 80%, suggesting a promising direction for optimizing clinical workflows through intelligent test design and selection.",
        paper_url="https://openreview.net/forum?id=DFSb67ksVr",
        image_path="/images/mavis.png",
        bibtex='''@article{jain2025mavis,
  title={Test-Time View Selection for Multi-Modal Decision Making},
  author={Jain, Eeshaan and Wenckstern, Johann and von Querfurth, Benedikt and Bunne, Charlotte},
  journal={ICLR 2025 Workshop},
  year={2025}
}'''
    ),
    
    Publication(
        title="AI-powered virtual tissues from spatial proteomics for clinical diagnostics and biomedical discovery",
        authors="Eeshaan Jain*, Johann Wenckstern*, Kiril Vasilev, Matteo Pariset, Andreas Wicki, Gabriele Gut, Charlotte Bunne",
        venue="ArXiv Preprint",
        abstract="Spatial proteomics technologies have transformed our understanding of complex tissue architectures by enabling simultaneous analysis of multiple molecular markers and their spatial organization. The high dimensionality of these data, varying marker combinations across experiments and heterogeneous study designs pose unique challenges for computational analysis. Here, we present Virtual Tissues (VirTues), a foundation model framework for biological tissues that operates across the molecular, cellular and tissue scale. VirTues introduces innovations in transformer architecture design, including a novel tokenization scheme that captures both spatial and marker dimensions, and attention mechanisms that scale to high-dimensional multiplex data while maintaining interpretability. Trained on diverse cancer and non-cancer tissue datasets, VirTues demonstrates strong generalization capabilities without task-specific fine-tuning, enabling cross-study analysis and novel marker integration. As a generalist model, VirTues outperforms existing approaches across clinical diagnostics, biological discovery and patient case retrieval tasks, while providing insights into tissue function and disease mechanisms.",
        paper_url="https://arxiv.org/pdf/2501.06039",
        image_path="/images/virtues.pdf",
        code_url="https://github.com/bunnelab/virtues",
        bibtex='''@article{wenckstern2025ai,
  title={AI-powered virtual tissues from spatial proteomics for clinical diagnostics and biomedical discovery},
  author={Wenckstern, Johann and Jain, Eeshaan and Vasilev, Kiril and Pariset, Matteo and Wicki, Andreas and Gut, Gabriele and Bunne, Charlotte},
  journal={arXiv preprint arXiv:2501.06039},
  year={2025}
}'''
    ),
    
    Publication(
        title="Clique Number Estimation via Differentiable Functions of Adjacency Matrix Permutations",
        authors="Indradyumna Roy*, Eeshaan Jain*, Soumen Chakrabarti, Abir De",
        venue="ICLR 2025",
        abstract="MxNet is a fully differentiable clique number estimator that learns from distant supervision without explicit clique demonstrations. We reformulate MCP as detecting dense submatrices via learned permutations within a nested subgraph matching task.",
        paper_url="https://openreview.net/forum?id=DFSb67ksVr",
        image_path="/images/clique-demo.png",
        bibtex='''@inproceedings{roy2025clique,
  title={Clique Number Estimation via Differentiable Functions of Adjacency Matrix Permutations},
  author={Roy, Indradyumna and Jain, Eeshaan and Chakrabarti, Soumen and De, Abir},
  booktitle={International Conference on Learning Representations},
  year={2025}
}'''
    ),
    
    Publication(
        title="Graph Edit Distance Evaluation Datasets: Pitfalls and Mitigation",
        authors="Eeshaan Jain*, Indradyumna Roy*, Saswat Meher, Soumen Chakrabarti, Abir De",
        venue="LoG 2024 (Extended Abstract)",
        abstract="Graph Edit Distance (GED) is a powerful framework for modeling both symmetric and asymmetric relationships between graph pairs under various cost settings. Due to the combinatorial intractability of exact GED computation, recent advancements have focused on neural GED estimators that approximate GED by leveraging data distribution characteristics. However, the datasets commonly used to benchmark such neural models exhibit two critical flaws: (1) significant isomorphism bias and (2) reliance on uniform edit costs for GED ground truths. Our datasets eliminate isomorphism leakage and incorporate a range of edit costs, facilitating more accurate assessment of GED methods.",
        paper_url="https://openreview.net/pdf?id=guapIeLs02",
        image_path="/images/ged-leakage.pdf",
        code_url="https://anonymous.4open.science/r/GED-Datasets/",
        bibtex='''@inproceedings{jain2024graph,
  title={Graph Edit Distance Evaluation Datasets: Pitfalls and Mitigation},
  author={Jain, Eeshaan and Roy, Indradyumna and Meher, Saswat and Chakrabarti, Soumen and De, Abir},
  booktitle={The Third Learning on Graphs Conference},
  year={2024},
  url={https://openreview.net/forum?id=guapIeLs02}
}'''
    ),
    
    Publication(
        title="Graph Edit Distance with General Costs Using Neural Set Divergence",
        authors="Eeshaan Jain*, Indradyumna Roy*, Saswat Meher, Soumen Chakrabarti, Abir De",
        venue="NeurIPS 2024 and LoG 2024 (Extended Abstract)",
        abstract="GraphEdx is the first-of-its-kind neural GED framework that incorporates variable edit costs, capable of modeling both symmetric and asymmetric graph (dis)similarities, allowing for more flexible and accurate GED estimation compared to earlier methods.",
        paper_url="https://openreview.net/forum?id=u7JRmrGutT",
        image_path="/images/GRAPHEDX.png",
        code_url="https://github.com/structlearning/GraphEdX",
        arxiv_url="https://arxiv.org/abs/2409.17687",
        bibtex='''@inproceedings{jain2024graph,
  title={Graph Edit Distance with General Costs Using Neural Set Divergence},
  author={Jain, Eeshaan and Roy, Indradyumna and Meher, Saswat and Chakrabarti, Soumen and De, Abir},
  booktitle={The Thirty-eighth Annual Conference on Neural Information Processing Systems},
  year={2024},
  url={https://openreview.net/forum?id=u7JRmrGutT}
}'''
    ),
    
    Publication(
        title="Efficient Data Subset Selection to Generalize Training Across Models: Transductive and Inductive Networks",
        authors="Eeshaan Jain, Tushar Nandy, Gaurav Aggarwal, Ashish V. Tendulkar, Rishabh K Iyer, Abir De",
        venue="NeurIPS 2023",
        abstract="Existing subset selection methods for efficient learning predominantly employ discrete combinatorial and model-specific approaches, which lack generalizability--- for each new model, the algorithm has to be executed from the beginning. We propose `SubSelNet`, a non-adaptive subset selection framework, which tackles these problems.",
        paper_url="https://openreview.net/forum?id=q3fCWoC9l0",
        image_path="/images/subselnet.pdf",
        code_url="https://github.com/structlearning/subselnet",
        arxiv_url="https://arxiv.org/pdf/2409.12255",
        bibtex='''@article{jain2023efficient,
  title={Efficient data subset selection to generalize training across models: Transductive and inductive networks},
  author={Jain, Eeshaan and Nandy, Tushar and Aggarwal, Gaurav and Tendulkar, Ashish and Iyer, Rishabh and De, Abir},
  journal={Advances in Neural Information Processing Systems},
  volume={36},
  pages={4716--4740},
  year={2023}
}'''
    ),
]

# ============================================================================
# GENERATE THE HTML FILE
# ============================================================================

if __name__ == "__main__":
    generate_publications_html(publications, "research.html")