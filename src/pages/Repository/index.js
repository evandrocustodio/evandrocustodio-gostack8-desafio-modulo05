import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import {
  Form,
  Loading,
  Owner,
  IssuesList,
  SubmitButton,
  Paginacao,
} from './styles';
import Container from '../../Components/Container';
import api from '../../services/api';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repo: [],
    issues: [],
    loading: true,
    issuesFilter: 'open',
    pagina: 1,
  };

  handleSubmit = async e => {
    e.preventDefault();
  };

  handleChange = e => {
    this.setState({
      issuesFilter: e.target.value.toString(),
    });
  };

  handleIncrementPage = () => {
    const { pagina } = this.state;

    const nextPage = pagina + 1;

    this.setState({
      pagina: nextPage,
      loading: true,
    });
  };

  handleDecrementPage = () => {
    const { pagina } = this.state;

    const prevPage = pagina - 1;

    if (prevPage > 0) {
      this.setState({
        pagina: prevPage,
        loading: true,
      });
    }
  };

  async carregarDados() {
    const { match } = this.props;
    const { issuesFilter, pagina } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repo, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesFilter,
          page: pagina,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      issues: issues.data,
      repo: repo.data,
      loading: false,
    });
  }

  render() {
    this.carregarDados();

    const { issues, repo, loading, pagina } = this.state;
    if (loading) {
      return <Loading>Carregando ...</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to='/'>Retornar para lista de Repositórios</Link>
          <img src={repo.owner.avatar_url} alt={repo.owner.login} />
          <h1>{repo.name}</h1>
          <p>{repo.description}</p>
        </Owner>
        <Form onSubmit={this.handleSubmit}>
          <span>Filtro: </span>
          <select onChange={this.handleChange}>
            <option value='all'>Todas as Issues</option>
            <option value='open' defaultValue>
              Somente Issues abertas
            </option>
            <option value='closed'>Somente Issues Encerradas</option>
          </select>

          <SubmitButton>
            <FaSearch color='#FFF' size={14} />
          </SubmitButton>
        </Form>
        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <span> {issue.state}</span>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <Paginacao>
          <SubmitButton show={pagina < 2}>
            {pagina > 1 ? (
              <FaArrowLeft
                color='#FFF'
                size={14}
                onClick={this.handleDecrementPage}
              />
            ) : (
              <FaArrowLeft color='#FFF' size={14} />
            )}
          </SubmitButton>
          <span>Página {pagina}</span>
          <SubmitButton>
            <FaArrowRight
              color='#FFF'
              size={14}
              onClick={this.handleIncrementPage}
            />
          </SubmitButton>
        </Paginacao>
      </Container>
    );
  }
}
